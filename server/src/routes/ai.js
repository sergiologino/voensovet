import express from 'express';
import axios from 'axios';
import { pool } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticateToken);

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net';
let AI_API_KEY = process.env.AI_SERVICE_API_KEY;

// Получить или создать API ключ для клиентского приложения
async function getOrCreateApiKey(userId) {
  // Проверяем есть ли уже сохраненный ключ в настройках пользователя
  // В реальности можно хранить это в отдельной таблице client_applications
  // Пока используем простой подход - один ключ на приложение
  
  if (!AI_API_KEY) {
    // Если ключа нет, нужно зарегистрировать клиентское приложение в AI сервисе
    // Для этого нужна авторизация в AI сервисе как пользователь
    // Пока используем переменную окружения
    throw new Error('AI Service API Key не настроен. Обратитесь к администратору.');
  }

  return AI_API_KEY;
}

// Получить доступные нейросети
router.get('/networks', async (req, res, next) => {
  try {
    const apiKey = await getOrCreateApiKey(req.user.id);

    const response = await axios.get(`${AI_SERVICE_URL}/api/ai/networks/available`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    res.json({ networks: response.data });
  } catch (error) {
    console.error('AI networks error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Ошибка при получении списка нейросетей',
      details: error.response?.data || error.message
    });
  }
});

// Обработать запрос через две нейросети
router.post('/process', async (req, res, next) => {
  try {
    const { userQuery } = req.body;

    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({ error: 'Запрос пользователя обязателен' });
    }

    const apiKey = await getOrCreateApiKey(req.user.id);

    // Получаем промпты из настроек админа
    const settingsResult = await pool.query(
      'SELECT key, value FROM admin_settings WHERE key IN ($1, $2)',
      ['primary_prompt', 'secondary_prompt']
    );

    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    const primaryPrompt = settings.primary_prompt || 'Проанализируй следующий запрос пользователя и определи его тематику, категорию и основные вопросы.';
    const secondaryPrompt = settings.secondary_prompt || 'На основе следующего анализа запроса пользователя, дай развернутый и точный ответ.';

    // Первый запрос - анализ запроса пользователя
    const primaryRequest = {
      userId: req.user.id.toString(),
      requestType: 'chat',
      payload: {
        messages: [
          {
            role: 'system',
            content: primaryPrompt
          },
          {
            role: 'user',
            content: userQuery
          }
        ]
      }
    };

    console.log('Отправка первичного запроса в AI...');
    const primaryResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/process`,
      primaryRequest,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (primaryResponse.data.status !== 'success') {
      throw new Error(`Первичный запрос не удался: ${primaryResponse.data.errorMessage || 'Неизвестная ошибка'}`);
    }

    // Извлекаем ответ из первичного запроса
    const primaryAnalysis = primaryResponse.data.response?.choices?.[0]?.message?.content 
      || primaryResponse.data.response?.text 
      || JSON.stringify(primaryResponse.data.response);

    // Второй запрос - развернутый ответ на основе анализа
    const secondaryRequest = {
      userId: req.user.id.toString(),
      requestType: 'chat',
      payload: {
        messages: [
          {
            role: 'system',
            content: secondaryPrompt
          },
          {
            role: 'user',
            content: `Анализ запроса: ${primaryAnalysis}\n\nИсходный запрос пользователя: ${userQuery}`
          }
        ]
      }
    };

    console.log('Отправка вторичного запроса в AI...');
    const secondaryResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/process`,
      secondaryRequest,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (secondaryResponse.data.status !== 'success') {
      throw new Error(`Вторичный запрос не удался: ${secondaryResponse.data.errorMessage || 'Неизвестная ошибка'}`);
    }

    // Извлекаем финальный ответ
    const finalAnswer = secondaryResponse.data.response?.choices?.[0]?.message?.content 
      || secondaryResponse.data.response?.text 
      || JSON.stringify(secondaryResponse.data.response);

    // Сохраняем запрос в БД
    await pool.query(
      `INSERT INTO ai_requests 
       (user_id, primary_prompt, primary_response, secondary_prompt, secondary_response, 
        network_used, tokens_used, execution_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user.id,
        userQuery,
        primaryAnalysis,
        `${secondaryPrompt}\n\nАнализ: ${primaryAnalysis}\n\nЗапрос: ${userQuery}`,
        finalAnswer,
        secondaryResponse.data.networkUsed || 'unknown',
        (primaryResponse.data.tokensUsed || 0) + (secondaryResponse.data.tokensUsed || 0),
        (primaryResponse.data.executionTimeMs || 0) + (secondaryResponse.data.executionTimeMs || 0)
      ]
    );

    res.json({
      success: true,
      answer: finalAnswer,
      analysis: primaryAnalysis,
      networkUsed: secondaryResponse.data.networkUsed,
      tokensUsed: (primaryResponse.data.tokensUsed || 0) + (secondaryResponse.data.tokensUsed || 0),
      executionTimeMs: (primaryResponse.data.executionTimeMs || 0) + (secondaryResponse.data.executionTimeMs || 0)
    });
  } catch (error) {
    console.error('AI process error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Ошибка при обработке запроса',
      details: error.response?.data || error.message
    });
  }
});

// Получить историю AI запросов пользователя
router.get('/history', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT id, primary_prompt, secondary_response, network_used, tokens_used, 
              execution_time_ms, created_at 
       FROM ai_requests 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_requests WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      requests: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

export default router;


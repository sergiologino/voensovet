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
  console.log('🔍 Checking AI_API_KEY:', AI_API_KEY ? '[SET]' : '[NOT SET]');
  
  // Проверяем есть ли уже сохраненный ключ в настройках пользователя
  // В реальности можно хранить это в отдельной таблице client_applications
  // Пока используем простой подход - один ключ на приложение
  
  if (!AI_API_KEY) {
    // Если ключа нет, нужно зарегистрировать клиентское приложение в AI сервисе
    // Для этого нужна авторизация в AI сервисе как пользователь
    // Пока используем переменную окружения
    console.error('❌ AI Service API Key не настроен!');
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
  console.log('🤖 AI process request received');
  console.log('User:', req.user ? `ID: ${req.user.id}` : 'NOT AUTHENTICATED');
  console.log('Body:', { userQuery: req.body.userQuery?.substring(0, 50) + '...', regionName: req.body.regionName });
  
  try {
    const { userQuery, regionName } = req.body;

    if (!userQuery || typeof userQuery !== 'string') {
      console.log('❌ Validation failed: userQuery invalid');
      return res.status(400).json({ error: 'Запрос пользователя обязателен' });
    }

    console.log('🔑 Getting API key...');
    const apiKey = await getOrCreateApiKey(req.user.id);
    console.log('✅ API key obtained');

    // Получаем данные пользователя
    console.log('👤 Fetching user data...');
    const userResult = await pool.query(
      'SELECT full_name, phone, email FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0] || {};
    const userName = user.full_name || null;
    console.log('✅ User data fetched:', { userName, phone: user.phone, email: user.email });
    
    // Определяем имя и отчество для обращения
    let nameForAddress = '';
    if (userName) {
      const nameParts = userName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        // Берем имя и отчество
        nameForAddress = `${nameParts[1]} ${nameParts[2] || ''}`.trim();
      } else if (nameParts.length === 1) {
        nameForAddress = nameParts[0];
      }
    }

    // Получаем промпты из настроек админа
    console.log('📋 Fetching admin settings...');
    const settingsResult = await pool.query(
      'SELECT key, value FROM admin_settings WHERE key IN ($1, $2)',
      ['primary_prompt', 'secondary_prompt']
    );

    const settings = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    const primaryPrompt = settings.primary_prompt || 'Проанализируй следующий запрос пользователя и определи его тематику, категорию и основные вопросы.';
    const secondaryPromptBase = settings.secondary_prompt || 'На основе следующего анализа запроса пользователя, дай развернутый и точный ответ.';
    console.log('✅ Admin settings fetched');

    // Получаем доступные нейросети и сортируем по приоритету
    const networksResponse = await axios.get(`${AI_SERVICE_URL}/api/ai/networks/available`, {
      headers: { 'X-API-Key': apiKey }
    });

    const networks = networksResponse.data || [];
    console.log('✅ Networks fetched:', networks.length, 'networks available');
    console.log('Available networks:', networks.map(n => `${n.name} (priority: ${n.priority})`).join(', '));
    
    // Сортируем по приоритету: БОЛЬШИЙ приоритет = выше в списке (обратная сортировка)
    // Приоритет 90 > Приоритет 1, поэтому 90 должен быть первым
    const sortedNetworks = networks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Первый запрос - сеть с БОЛЬШИМ приоритетом (например, 90)
    // Второй запрос - сеть с МЕНЬШИМ приоритетом (например, 1 или 15)
    const firstNetwork = sortedNetworks[0]; // Больший приоритет (первый запрос - быстрый анализ)
    const secondNetwork = sortedNetworks[sortedNetworks.length - 1]; // Меньший приоритет (второй запрос - детальный ответ)

    if (!firstNetwork || !secondNetwork) {
      throw new Error('Не найдены доступные нейросети');
    }

    console.log(`Используем сети: первая (приоритет ${firstNetwork.priority}) - ${firstNetwork.name}, вторая (приоритет ${secondNetwork.priority}) - ${secondNetwork.name}`);

    // Первый запрос - анализ запроса пользователя (в сеть с меньшим приоритетом, например 90)
    const primaryRequest = {
      userId: req.user.id.toString(),
      networkName: firstNetwork.name,
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

    console.log(`Отправка первичного запроса в AI (сеть с приоритетом ${firstNetwork.priority})...`);
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

    // Формируем второй промпт с учетом региона и данных пользователя
    let secondaryPrompt = secondaryPromptBase;
    
    if (regionName) {
      secondaryPrompt += `\n\nВАЖНО: Пользователь находится в регионе: ${regionName}. Учитывай региональное законодательство и местные особенности при формировании ответа.`;
    }
    
    if (nameForAddress) {
      secondaryPrompt += `\n\nОбращайся к пользователю по имени-отчеству: ${nameForAddress}.`;
    }
    
    secondaryPrompt += `\n\nТребования к ответу:
1. Ответ должен быть разделен на ДВЕ части:
   
   ЧАСТЬ 1 - КРАТКИЙ ОТВЕТ (до 300 слов):
   - Емкий список основных пунктов
   - Ключевая информация по делу
   - Основные шаги действий
   - Формат: маркированный список или короткие абзацы
   
   ЧАСТЬ 2 - ПОДРОБНЫЙ ОТВЕТ (после разделителя "===ПОДРОБНО==="):
   - Полное обоснование каждого пункта
   - Конкретные статьи законов (федеральных и региональных ${regionName ? `для региона ${regionName}` : ''})
   - Телефоны, адреса и URL организаций (обязательно, если упоминаются)
   - Пошаговый порядок действий с деталями
   - Ссылки на нормативные акты
   - Контактная информация организаций
   
2. Формат ответа:
   [КРАТКИЙ ОТВЕТ - список основных пунктов]
   
   ===ПОДРОБНО===
   
   [ПОДРОБНЫЙ ОТВЕТ - с обоснованиями, законами, контактами]
   
3. Обязательно указывай:
   - Телефоны организаций в формате: +7 (XXX) XXX-XX-XX или 8-800-XXX-XX-XX
   - Адреса в полном формате
   - URL веб-сайтов
   - Номера статей законов с названиями документов`;

    // Второй запрос - развернутый ответ на основе анализа (в сеть с большим приоритетом, например 100)
    const secondaryRequest = {
      userId: req.user.id.toString(),
      networkName: secondNetwork.name,
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

    console.log(`Отправка вторичного запроса в AI (сеть с приоритетом ${secondNetwork.priority})...`);
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
    const fullAnswer = secondaryResponse.data.response?.choices?.[0]?.message?.content 
      || secondaryResponse.data.response?.text 
      || JSON.stringify(secondaryResponse.data.response);

    // Разделяем ответ на краткий и подробный
    let shortAnswer = '';
    let detailedAnswer = fullAnswer;

    // Ищем разделитель "===ПОДРОБНО==="
    const detailedSeparator = '===ПОДРОБНО===';
    const separatorIndex = fullAnswer.indexOf(detailedSeparator);
    
    if (separatorIndex > 0) {
      // Есть явный разделитель
      shortAnswer = fullAnswer.substring(0, separatorIndex).trim();
      detailedAnswer = fullAnswer.substring(separatorIndex + detailedSeparator.length).trim();
    } else {
      // Ищем альтернативные разделители
      const altSeparators = [
        '=== ПОДРОБНО ===',
        '===ПОДРОБНЕЕ===',
        '---ПОДРОБНО---',
        'ПОДРОБНО:',
        'Детали:',
        'Обоснование:'
      ];
      
      let foundSeparator = false;
      for (const sep of altSeparators) {
        const idx = fullAnswer.indexOf(sep);
        if (idx > 0) {
          shortAnswer = fullAnswer.substring(0, idx).trim();
          detailedAnswer = fullAnswer.substring(idx + sep.length).trim();
          foundSeparator = true;
          break;
        }
      }
      
      if (!foundSeparator) {
        // Если нет разделителя, пытаемся найти краткое резюме
        const lines = fullAnswer.split('\n');
        const summaryEndIndex = lines.findIndex((line, index) => 
          index > 5 && (
            line.toLowerCase().includes('подробнее') || 
            line.toLowerCase().includes('детали') ||
            line.toLowerCase().includes('обоснование') ||
            line.toLowerCase().includes('законы') ||
            line.toLowerCase().includes('стать')
          )
        );

        if (summaryEndIndex > 0 && summaryEndIndex < lines.length / 2) {
          shortAnswer = lines.slice(0, summaryEndIndex).join('\n').trim();
          detailedAnswer = lines.slice(summaryEndIndex).join('\n').trim();
        } else {
          // Берем первые 400 символов как краткий ответ
          shortAnswer = fullAnswer.substring(0, 400).trim();
          if (fullAnswer.length > 400) {
            // Пытаемся обрезать по последней точке или переносу строки
            const lastDot = shortAnswer.lastIndexOf('.');
            const lastNewline = shortAnswer.lastIndexOf('\n');
            const cutPoint = Math.max(lastDot, lastNewline);
            if (cutPoint > 200) {
              shortAnswer = shortAnswer.substring(0, cutPoint + 1);
            } else {
              shortAnswer += '...';
            }
          }
          detailedAnswer = fullAnswer;
        }
      }
    }
    
    // Если краткий ответ пустой или слишком короткий, используем первые 300 символов
    if (!shortAnswer || shortAnswer.length < 50) {
      shortAnswer = fullAnswer.substring(0, 300).trim();
      if (fullAnswer.length > 300) {
        shortAnswer += '...';
      }
      detailedAnswer = fullAnswer;
    }

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
        fullAnswer,
        `${firstNetwork.name} -> ${secondNetwork.name}`,
        (primaryResponse.data.tokensUsed || 0) + (secondaryResponse.data.tokensUsed || 0),
        (primaryResponse.data.executionTimeMs || 0) + (secondaryResponse.data.executionTimeMs || 0)
      ]
    );

    res.json({
      success: true,
      shortAnswer: shortAnswer,
      detailedAnswer: detailedAnswer,
      analysis: primaryAnalysis,
      networkUsed: `${firstNetwork.name} -> ${secondNetwork.name}`,
      tokensUsed: (primaryResponse.data.tokensUsed || 0) + (secondaryResponse.data.tokensUsed || 0),
      executionTimeMs: (primaryResponse.data.executionTimeMs || 0) + (secondaryResponse.data.executionTimeMs || 0)
    });
  } catch (error) {
    console.error('❌ AI process error:', error.message);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    res.status(error.response?.status || 500).json({
      error: 'Ошибка при обработке запроса',
      details: process.env.NODE_ENV === 'production' ? error.message : error.response?.data || error.message
    });
  }
});

// Получить историю AI запросов пользователя
router.get('/history', async (req, res, next) => {
  try {
    console.log('📋 AI History requested by user:', req.user?.id);
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

    console.log(`✅ Found ${result.rows.length} AI requests for user ${req.user.id}`);

    res.json({
      requests: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('❌ Error fetching AI history:', error);
    next(error);
  }
});

export default router;




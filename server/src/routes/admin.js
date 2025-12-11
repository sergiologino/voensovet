import express from 'express';
import { pool } from '../db/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Все роуты требуют авторизации и прав администратора
router.use(authenticateToken);
router.use(requireAdmin);

// Получить настройки админа (промпты)
router.get('/settings', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT key, value, updated_at FROM admin_settings ORDER BY key'
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        updatedAt: row.updated_at
      };
    });

    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

// Обновить настройки админа (промпты)
router.put('/settings', async (req, res, next) => {
  try {
    const { primaryPrompt, secondaryPrompt } = req.body;

    if (primaryPrompt !== undefined) {
      await pool.query(
        `UPDATE admin_settings 
         SET value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE key = 'primary_prompt'`,
        [primaryPrompt, req.user.id]
      );
    }

    if (secondaryPrompt !== undefined) {
      await pool.query(
        `UPDATE admin_settings 
         SET value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE key = 'secondary_prompt'`,
        [secondaryPrompt, req.user.id]
      );
    }

    // Возвращаем обновленные настройки
    const result = await pool.query(
      'SELECT key, value, updated_at FROM admin_settings ORDER BY key'
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        updatedAt: row.updated_at
      };
    });

    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

// Получить статистику пользователей
router.get('/users/stats', async (req, res, next) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = await pool.query(
      'SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE expires_at > NOW()'
    );
    const totalRequests = await pool.query('SELECT COUNT(*) FROM user_requests');
    const totalAiRequests = await pool.query('SELECT COUNT(*) FROM ai_requests');

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      totalRequests: parseInt(totalRequests.rows[0].count),
      totalAiRequests: parseInt(totalAiRequests.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
});

// Получить список пользователей
router.get('/users', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT id, phone, email, full_name, is_admin, provider, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

// Получить историю AI запросов
router.get('/ai-requests', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT ar.*, u.phone, u.email, u.full_name 
       FROM ai_requests ar
       LEFT JOIN users u ON ar.user_id = u.id
       ORDER BY ar.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM ai_requests');

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


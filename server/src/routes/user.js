import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticateToken);

// Получить профиль пользователя
router.get('/profile', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, phone, email, full_name, is_admin, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Обновить профиль пользователя
router.put('/profile', async (req, res, next) => {
  try {
    const { fullName, email, phone } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }

    if (email !== undefined) {
      // Проверяем что email не занят другим пользователем
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email уже используется' });
      }
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (phone !== undefined) {
      // Проверяем что телефон не занят другим пользователем
      const phoneCheck = await pool.query(
        'SELECT id FROM users WHERE phone = $1 AND id != $2',
        [phone, req.user.id]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Телефон уже используется' });
      }
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, phone, email, full_name, is_admin`;
    
    const result = await pool.query(query, values);

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Изменить пароль
router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    // Проверяем текущий пароль
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0 || !userResult.rows[0].password_hash) {
      return res.status(400).json({ error: 'Пароль не может быть изменен для этого аккаунта' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, req.user.id]
    );

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    next(error);
  }
});

// Получить историю запросов пользователя
router.get('/requests', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT id, page_url, page_title, created_at 
       FROM user_requests 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM user_requests WHERE user_id = $1',
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

// Добавить запись в историю (вызывается при переходе на страницу)
router.post('/requests', async (req, res, next) => {
  try {
    const { pageUrl, pageTitle } = req.body;

    if (!pageUrl) {
      return res.status(400).json({ error: 'URL страницы обязателен' });
    }

    await pool.query(
      'INSERT INTO user_requests (user_id, page_url, page_title) VALUES ($1, $2, $3)',
      [req.user.id, pageUrl, pageTitle || null]
    );

    res.json({ message: 'Запись добавлена' });
  } catch (error) {
    next(error);
  }
});

export default router;




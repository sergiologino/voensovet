import jwt from 'jsonwebtoken';
import { pool } from '../db/init.js';

export async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем что сессия существует в БД
    const sessionResult = await pool.query(
      'SELECT * FROM user_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Сессия истекла' });
    }

    // Получаем данные пользователя
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = userResult.rows[0];
    req.session = sessionResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    next(error);
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
}




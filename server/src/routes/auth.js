import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { pool } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting для авторизации
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток
  message: 'Слишком много попыток входа. Попробуйте позже.'
});

// Простая капча (можно заменить на reCAPTCHA)
function validateSimpleCaptcha(captchaValue) {
  // Простая проверка - в реальности лучше использовать reCAPTCHA или hCaptcha
  // Для начала просто проверяем что значение не пустое
  return captchaValue && captchaValue.length > 0;
}

// Регистрация
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { phone, password, fullName, captcha } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Телефон и пароль обязательны' });
    }

    if (!validateSimpleCaptcha(captcha)) {
      return res.status(400).json({ error: 'Проверка капчи не пройдена' });
    }

    // Проверяем существует ли пользователь
    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким телефоном уже существует' });
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const result = await pool.query(
      `INSERT INTO users (phone, password_hash, full_name, provider)
       VALUES ($1, $2, $3, 'local')
       RETURNING id, phone, email, full_name, is_admin, created_at`,
      [phone, passwordHash, fullName || null]
    );

    const user = result.rows[0];

    // Создаем сессию
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Вход
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { phone, password, captcha } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Телефон и пароль обязательны' });
    }

    if (!validateSimpleCaptcha(captcha)) {
      return res.status(400).json({ error: 'Проверка капчи не пройдена' });
    }

    // Находим пользователя
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    const user = result.rows[0];

    // Проверяем пароль
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    // Создаем сессию
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Выход
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await pool.query('DELETE FROM user_sessions WHERE token = $1', [token]);
    }

    res.clearCookie('token');
    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    next(error);
  }
});

// Получить текущего пользователя
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      phone: req.user.phone,
      email: req.user.email,
      fullName: req.user.full_name,
      isAdmin: req.user.is_admin
    }
  });
});

// OAuth Yandex - начало авторизации
router.get('/yandex', (req, res) => {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.YANDEX_REDIRECT_URI);
  const state = req.query.state || 'default';
  
  const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
  
  res.redirect(yandexAuthUrl);
});

// OAuth Yandex - callback
router.get('/yandex/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Обмениваем код на токен
    const tokenResponse = await axios.post('https://oauth.yandex.ru/token', {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.YANDEX_CLIENT_ID,
      client_secret: process.env.YANDEX_CLIENT_SECRET
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;

    // Получаем информацию о пользователе
    const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${access_token}` }
    });

    const yandexUser = userInfoResponse.data;
    const yandexId = yandexUser.id;

    // Ищем или создаем пользователя
    let userResult = await pool.query('SELECT * FROM users WHERE yandex_id = $1', [yandexId]);

    let user;
    if (userResult.rows.length === 0) {
      // Создаем нового пользователя
      const result = await pool.query(
        `INSERT INTO users (email, full_name, yandex_id, provider)
         VALUES ($1, $2, $3, 'yandex')
         RETURNING id, phone, email, full_name, is_admin, created_at`,
        [yandexUser.default_email, yandexUser.real_name || yandexUser.display_name, yandexId]
      );
      user = result.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Создаем сессию
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Редирект на фронтенд с токеном
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Yandex OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

export default router;




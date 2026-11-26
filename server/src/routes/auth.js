import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { pool } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { isEnabledRegionId, getEnabledRegionIds } from '../regions.js';
import rateLimit from 'express-rate-limit';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

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

// Функция для определения типа контакта (телефон или email)
function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Функция для очистки телефона от форматирования
function cleanPhone(phone) {
  // Убираем все кроме цифр и +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Если начинается с +7, оставляем как есть, иначе добавляем +7
  if (cleaned.startsWith('+7')) {
    return cleaned;
  } else if (cleaned.startsWith('7')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('8')) {
    return '+7' + cleaned.substring(1);
  } else {
    return '+7' + cleaned;
  }
}

// Регистрация
router.post('/register', authLimiter, async (req, res, next) => {
  console.log('📝 Registration request received');
  
  try {
    const { phone, password, fullName, captcha, regionId } = req.body;

    if (!isEnabledRegionId(regionId, await getEnabledRegionIds())) {
      return res.status(400).json({ error: 'Выберите доступный регион проживания' });
    }

    if (!phone || !password) {
      console.log('❌ Validation failed: missing phone or password');
      return res.status(400).json({ error: 'Контакт (телефон или email) и пароль обязательны' });
    }

    if (!validateSimpleCaptcha(captcha)) {
      console.log('❌ Captcha validation failed');
      return res.status(400).json({ error: 'Проверка капчи не пройдена' });
    }

    // Определяем тип контакта
    const isEmailContact = isEmail(phone);
    let phoneValue = null;
    let emailValue = null;

    if (isEmailContact) {
      emailValue = phone.toLowerCase().trim();
      console.log('📧 Email registration');
      
      // Проверяем существует ли пользователь с таким email
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [emailValue]);
      if (existingUser.rows.length > 0) {
        console.log('❌ User with this email already exists');
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
    } else {
      // Очищаем телефон от форматирования
      phoneValue = cleanPhone(phone);
      console.log('📱 Phone registration');
      
      // Проверяем существует ли пользователь с таким телефоном
      const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phoneValue]);
      if (existingUser.rows.length > 0) {
        console.log('❌ User with this phone already exists');
        return res.status(400).json({ error: 'Пользователь с таким телефоном уже существует' });
      }
    }

    // Хешируем пароль
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    console.log('💾 Creating user in database...');
    const result = await pool.query(
      `INSERT INTO users (phone, email, password_hash, full_name, region_id, provider)
       VALUES ($1, $2, $3, $4, $5, 'local')
       RETURNING id, phone, email, full_name, region_id, is_admin, created_at`,
      [phoneValue, emailValue, passwordHash, fullName || null, regionId]
    );

    const user = result.rows[0];
    console.log('✅ User created successfully');

    // Создаем сессию
    console.log('🔑 Creating JWT token...');
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней
    
    console.log('💾 Saving session to database...');

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

    console.log('✅ Registration completed successfully');
    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin,
        regionId: user.region_id
      },
      token
    });
  } catch (error) {
    console.error('Registration failed', { code: error.code || 'unknown' });
    next(error);
  }
});

// Вход
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { phone, password, captcha } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Контакт (телефон или email) и пароль обязательны' });
    }

    if (!validateSimpleCaptcha(captcha)) {
      return res.status(400).json({ error: 'Проверка капчи не пройдена' });
    }

    // Определяем тип контакта и ищем пользователя
    const isEmailContact = isEmail(phone);
    let query, queryValue;
    
    if (isEmailContact) {
      query = 'SELECT * FROM users WHERE email = $1';
      queryValue = phone.toLowerCase().trim();
    } else {
      query = 'SELECT * FROM users WHERE phone = $1';
      queryValue = cleanPhone(phone);
    }
    
    const result = await pool.query(query, [queryValue]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный контакт или пароль' });
    }

    const user = result.rows[0];

    // Проверяем пароль
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Неверный контакт или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный контакт или пароль' });
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
        isAdmin: user.is_admin,
        regionId: user.region_id,
        yandexLinked: Boolean(user.yandex_id)
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
      isAdmin: req.user.is_admin,
      regionId: req.user.region_id,
      yandexLinked: Boolean(req.user.yandex_id)
    }
  });
});

function yandexAuthorizationUrl(state) {
  const clientId = process.env.YANDEX_CLIENT_ID?.trim();
  const clientSecret = process.env.YANDEX_CLIENT_SECRET?.trim();
  const redirectUri = process.env.YANDEX_REDIRECT_URI?.trim();
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  if (!clientId || !clientSecret || !redirectUri || !frontendUrl) return null;
  const url = new URL('https://oauth.yandex.ru/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  if (state) url.searchParams.set('state', state);
  return url.toString();
}

// OAuth Yandex - начало авторизации
router.get('/yandex', (req, res) => {
  const url = yandexAuthorizationUrl();
  if (!url) {
    return res.status(503).json({ error: 'Вход через Яндекс не настроен. Обратитесь к администратору.' });
  }
  res.redirect(url);
});

// Привязка Яндекса начинается только из действующей сессии существующего аккаунта.
router.post('/yandex/link', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.yandex_id) return res.status(409).json({ error: 'Яндекс уже привязан к этому аккаунту' });
    const state = randomBytes(32).toString('hex');
    const url = yandexAuthorizationUrl(state);
    if (!url) return res.status(503).json({ error: 'Вход через Яндекс не настроен. Обратитесь к администратору.' });
    const stateHash = createHash('sha256').update(state).digest('hex');
    await pool.query('DELETE FROM yandex_link_states WHERE expires_at <= NOW()');
    await pool.query(
      "INSERT INTO yandex_link_states (state_hash, user_id, session_id, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')",
      [stateHash, req.user.id, req.session.id]
    );
    res.cookie('yandex_link_state', state, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/api/auth/yandex/callback', maxAge: 10 * 60 * 1000
    });
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// OAuth Yandex - callback
router.get('/yandex/callback', async (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, '');
  if (!frontendUrl) return res.status(503).json({ error: 'Адрес сайта не настроен' });
  let stage = 'authorization';
  const state = req.query.state;
  const isLink = state !== undefined;
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${frontendUrl}/#auth-callback?error=${isLink ? 'link_failed' : 'oauth_failed'}`);
    }

    let linkUserId = null;
    if (isLink) {
      stage = 'link_state';
      const cookieState = req.cookies?.yandex_link_state;
      res.clearCookie('yandex_link_state', { path: '/api/auth/yandex/callback' });
      if (typeof state !== 'string' || typeof cookieState !== 'string' ||
          state.length !== cookieState.length ||
          !timingSafeEqual(Buffer.from(state), Buffer.from(cookieState))) {
        return res.redirect(`${frontendUrl}/#auth-callback?error=link_failed`);
      }
      const stateHash = createHash('sha256').update(state).digest('hex');
      const linkState = await pool.query(
        'DELETE FROM yandex_link_states WHERE state_hash = $1 AND expires_at > NOW() RETURNING user_id, session_id',
        [stateHash]
      );
      if (!linkState.rows[0]) return res.redirect(`${frontendUrl}/#auth-callback?error=link_failed`);
      const session = await pool.query(
        'SELECT user_id FROM user_sessions WHERE id = $1 AND expires_at > NOW()', [linkState.rows[0].session_id]
      );
      if (session.rows[0]?.user_id !== linkState.rows[0].user_id) {
        return res.redirect(`${frontendUrl}/#auth-callback?error=link_failed`);
      }
      linkUserId = linkState.rows[0].user_id;
    }

    // Обмениваем код на токен
    stage = 'token_exchange';
    const tokenResponse = await axios.post('https://oauth.yandex.ru/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.YANDEX_CLIENT_ID,
      client_secret: process.env.YANDEX_CLIENT_SECRET
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;

    // Получаем информацию о пользователе
    stage = 'user_info';
    const userInfoResponse = await axios.get('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${access_token}` }
    });

    const yandexUser = userInfoResponse.data;
    const yandexId = yandexUser.id;

    // Существующий аккаунт привязываем только после входа в него по паролю.
    stage = 'user_lookup';
    let userResult = await pool.query('SELECT * FROM users WHERE yandex_id = $1', [yandexId]);

    if (isLink) {
      if (userResult.rows.length > 0 && userResult.rows[0].id !== linkUserId) {
        return res.redirect(`${frontendUrl}/#auth-callback?error=link_failed`);
      }
      stage = 'user_link';
      const linked = await pool.query(
        'UPDATE users SET yandex_id = $1 WHERE id = $2 AND (yandex_id IS NULL OR yandex_id = $1) RETURNING id',
        [yandexId, linkUserId]
      );
      if (linked.rows.length === 0) return res.redirect(`${frontendUrl}/#auth-callback?error=link_failed`);
      return res.redirect(`${frontendUrl}/#profile?linked=yandex`);
    }

    let user;
    if (userResult.rows.length === 0) {
      if (yandexUser.default_email) {
        const existingEmail = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [yandexUser.default_email]);
        if (existingEmail.rows.length > 0) {
          return res.redirect(`${frontendUrl}/#auth-callback?error=email_in_use`);
        }
      }
      // Создаем нового пользователя
      stage = 'user_create';
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

    stage = 'session_create';
    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Редирект на фронтенд с токеном
    res.redirect(`${frontendUrl}/#auth-callback?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('Yandex OAuth failed', {
      stage,
      httpStatus: error.response?.status,
      providerCode: error.response?.data?.error,
      databaseCode: error.code
    });
    const errorCode = isLink ? 'link_failed' : stage === 'user_create' && error.code === '23505' ? 'email_in_use' : 'oauth_failed';
    res.redirect(`${frontendUrl}/#auth-callback?error=${errorCode}`);
  }
});

export default router;




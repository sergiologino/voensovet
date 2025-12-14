// Точка входа сервера
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

console.log('=== Server Starting ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST ? '[SET]' : '[NOT SET]');
console.log('DB_PORT:', process.env.DB_PORT ? '[SET]' : '[NOT SET]');
console.log('DB_NAME:', process.env.DB_NAME ? '[SET]' : '[NOT SET]');
console.log('DB_USER:', process.env.DB_USER ? '[SET]' : '[NOT SET]');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN ? '[SET]' : '[NOT SET]');
console.log('YANDEX_CLIENT_ID:', process.env.YANDEX_CLIENT_ID ? '[SET]' : '[NOT SET]');
console.log('YANDEX_CLIENT_SECRET:', process.env.YANDEX_CLIENT_SECRET ? '[SET]' : '[NOT SET]');
console.log('YANDEX_REDIRECT_URI:', process.env.YANDEX_REDIRECT_URI ? '[SET]' : '[NOT SET]');
console.log('AI_SERVICE_URL:', process.env.AI_SERVICE_URL ? '[SET]' : '[NOT SET]');
console.log('AI_SERVICE_API_KEY:', process.env.AI_SERVICE_API_KEY ? '[SET]' : '[NOT SET]');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '[SET]' : '[NOT SET]');
console.log('======================');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV,
    database: {
      host: !!process.env.DB_HOST,
      port: !!process.env.DB_PORT,
      name: !!process.env.DB_NAME,
      user: !!process.env.DB_USER,
      password: !!process.env.DB_PASSWORD
    },
    services: {
      yandexOAuth: !!process.env.YANDEX_CLIENT_ID,
      aiService: !!process.env.AI_SERVICE_URL
    }
  });
});

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint (только для отладки, удалите в production)
app.get('/debug/env', (req, res) => {
  res.json({
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    database: {
      host: !!process.env.DB_HOST,
      port: !!process.env.DB_PORT,
      name: !!process.env.DB_NAME,
      user: !!process.env.DB_USER,
      password: !!process.env.DB_PASSWORD
    },
    jwt: {
      secret: !!process.env.JWT_SECRET,
      expiresIn: !!process.env.JWT_EXPIRES_IN
    },
    yandex: {
      clientId: !!process.env.YANDEX_CLIENT_ID,
      clientSecret: !!process.env.YANDEX_CLIENT_SECRET,
      redirectUri: !!process.env.YANDEX_REDIRECT_URI
    },
    aiService: {
      url: !!process.env.AI_SERVICE_URL,
      apiKey: !!process.env.AI_SERVICE_API_KEY
    },
    frontendUrl: !!process.env.FRONTEND_URL
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});


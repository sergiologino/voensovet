import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDatabase } from './db/init.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';

// Проверка обязательных переменных окружения
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Ошибка: Отсутствуют обязательные переменные окружения:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nУстановите переменные окружения перед запуском сервера.');
  console.error('См. ENVIRONMENT_VARIABLES.md для подробностей.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });


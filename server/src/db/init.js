import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'voensovet_db',
  user: process.env.DB_USER || 'voensovet_user',
  password: process.env.DB_PASSWORD || 'voensovet_password',
});

export async function initDatabase() {
  try {
    // Проверяем подключение
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Создаем таблицы если их нет
    await createTables();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  console.log('📋 Creating tables...');
  
  // Таблица пользователей
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(50) UNIQUE,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255),
      full_name VARCHAR(255),
      is_admin BOOLEAN DEFAULT FALSE,
      yandex_id VARCHAR(255) UNIQUE,
      provider VARCHAR(50) DEFAULT 'local',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Users table created/checked');
  
  // МИГРАЦИЯ: Добавляем недостающие колонки в существующую таблицу
  console.log('🔄 Running migrations for users table...');
  await pool.query(`
    DO $$ 
    BEGIN
      -- Добавляем provider если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'provider') THEN
        ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'local';
        RAISE NOTICE 'Column provider added to users table';
      END IF;
      
      -- Добавляем yandex_id если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'yandex_id') THEN
        ALTER TABLE users ADD COLUMN yandex_id VARCHAR(255) UNIQUE;
        RAISE NOTICE 'Column yandex_id added to users table';
      END IF;
      
      -- Добавляем full_name если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Column full_name added to users table';
      END IF;
      
      -- Добавляем is_admin если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Column is_admin added to users table';
      END IF;
      
      -- Добавляем updated_at если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Column updated_at added to users table';
      END IF;
      
      -- Расширяем phone до 50 символов если меньше
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'phone' 
                 AND character_maximum_length < 50) THEN
        ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(50);
        RAISE NOTICE 'Column phone extended to VARCHAR(50)';
      END IF;
      
      -- Убираем NOT NULL ограничение с phone (может быть NULL если регистрация через email)
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'phone' 
                 AND is_nullable = 'NO') THEN
        ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
        RAISE NOTICE 'NOT NULL constraint removed from phone column';
      END IF;
      
      -- Убираем NOT NULL ограничение с email (может быть NULL если регистрация через телефон)
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'email' 
                 AND is_nullable = 'NO') THEN
        ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
        RAISE NOTICE 'NOT NULL constraint removed from email column';
      END IF;
      
      -- Убираем NOT NULL ограничение с password_hash (может быть NULL для OAuth пользователей)
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'password_hash' 
                 AND is_nullable = 'NO') THEN
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
        RAISE NOTICE 'NOT NULL constraint removed from password_hash column';
      END IF;
    END $$;
  `);
  console.log('✅ Users table migrations completed');
  
  // Добавляем CHECK ограничение: хотя бы одно из полей phone или email должно быть заполнено
  console.log('🔄 Adding CHECK constraint...');
  await pool.query(`
    DO $$ 
    BEGIN
      -- Удаляем старое ограничение если оно есть
      IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'users_phone_or_email_required' 
                 AND table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT users_phone_or_email_required;
      END IF;
      
      -- Добавляем новое ограничение
      ALTER TABLE users ADD CONSTRAINT users_phone_or_email_required 
        CHECK (phone IS NOT NULL OR email IS NOT NULL OR yandex_id IS NOT NULL);
      RAISE NOTICE 'CHECK constraint added: at least one of phone, email, or yandex_id must be NOT NULL';
    EXCEPTION
      WHEN duplicate_object THEN
        RAISE NOTICE 'CHECK constraint already exists';
    END $$;
  `);
  console.log('✅ CHECK constraint added');

  // Таблица сессий
  console.log('📋 Creating user_sessions table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ user_sessions table created');

  // Таблица истории запросов пользователя (куда ходил)
  console.log('📋 Creating user_requests table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      page_url VARCHAR(500),
      page_title VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ user_requests table created');

  // Таблица AI запросов
  console.log('📋 Creating ai_requests table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      primary_prompt TEXT,
      primary_response TEXT,
      secondary_prompt TEXT,
      secondary_response TEXT,
      network_used VARCHAR(255),
      tokens_used INTEGER,
      execution_time_ms INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ ai_requests table created');
  
  // МИГРАЦИЯ: Добавляем недостающие колонки в существующую таблицу ai_requests
  console.log('🔄 Running migrations for ai_requests table...');
  await pool.query(`
    DO $$ 
    BEGIN
      -- Добавляем primary_response если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'primary_response') THEN
        ALTER TABLE ai_requests ADD COLUMN primary_response TEXT;
        RAISE NOTICE 'Column primary_response added to ai_requests table';
      END IF;
      
      -- Добавляем secondary_prompt если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'secondary_prompt') THEN
        ALTER TABLE ai_requests ADD COLUMN secondary_prompt TEXT;
        RAISE NOTICE 'Column secondary_prompt added to ai_requests table';
      END IF;
    END $$;
  `);
  console.log('✅ ai_requests table migrations completed');

  // Таблица настроек админа (промпты)
  console.log('📋 Creating admin_settings table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      updated_by INTEGER REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ admin_settings table created');

  // Создаем индексы для производительности
  console.log('📋 Creating indexes...');
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_user_requests_user_id ON user_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_requests_created_at ON user_requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
  `);
  console.log('✅ Indexes created');

  // Вставляем дефолтные настройки админа если их нет
  console.log('📋 Inserting default admin settings...');
  await pool.query(`
    INSERT INTO admin_settings (key, value)
    VALUES 
      ('primary_prompt', 'Проанализируй следующий запрос пользователя и определи его тематику, категорию и основные вопросы. Ответ должен быть кратким и структурированным.'),
      ('secondary_prompt', 'На основе следующего анализа запроса пользователя, дай развернутый и точный ответ, учитывая контекст и специфику вопроса.')
    ON CONFLICT (key) DO NOTHING
  `);
  console.log('✅ Default admin settings inserted');
  console.log('🎉 All tables and migrations completed successfully!');
}


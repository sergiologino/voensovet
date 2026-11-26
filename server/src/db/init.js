import pg from 'pg';
import { INITIAL_MEASURES } from '../data/initialMeasures.js';
import { normalizeMeasure } from '../measures.js';

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
    console.error('Database initialization failed', { code: error.code || 'unknown' });
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
      region_id VARCHAR(40),
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
      
      -- Регион проживания для маршрута поддержки
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'users' AND column_name = 'region_id') THEN
        ALTER TABLE users ADD COLUMN region_id VARCHAR(40);
      END IF;

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
      -- Добавляем primary_prompt если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'primary_prompt') THEN
        ALTER TABLE ai_requests ADD COLUMN primary_prompt TEXT;
        RAISE NOTICE 'Column primary_prompt added to ai_requests table';
      END IF;
      
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
      
      -- Добавляем secondary_response если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'secondary_response') THEN
        ALTER TABLE ai_requests ADD COLUMN secondary_response TEXT;
        RAISE NOTICE 'Column secondary_response added to ai_requests table';
      END IF;
      
      -- Добавляем network_used если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'network_used') THEN
        ALTER TABLE ai_requests ADD COLUMN network_used VARCHAR(255);
        RAISE NOTICE 'Column network_used added to ai_requests table';
      END IF;
      
      -- Добавляем tokens_used если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'tokens_used') THEN
        ALTER TABLE ai_requests ADD COLUMN tokens_used INTEGER;
        RAISE NOTICE 'Column tokens_used added to ai_requests table';
      END IF;
      
      -- Добавляем execution_time_ms если не существует
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'ai_requests' AND column_name = 'execution_time_ms') THEN
        ALTER TABLE ai_requests ADD COLUMN execution_time_ms INTEGER;
        RAISE NOTICE 'Column execution_time_ms added to ai_requests table';
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
      ,('enabled_regions', '["vladimir","kaluga"]')
    ON CONFLICT (key) DO NOTHING
  `);
  console.log('✅ Default admin settings inserted');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS benefit_measures (
      id BIGSERIAL PRIMARY KEY,
      source_key TEXT UNIQUE,
      title TEXT NOT NULL,
      topic VARCHAR(30) NOT NULL,
      scope VARCHAR(10) NOT NULL CHECK (scope IN ('federal', 'regional')),
      region_id VARCHAR(40),
      locality TEXT NOT NULL DEFAULT '',
      audiences JSONB NOT NULL DEFAULT '[]'::jsonb,
      match_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
      summary TEXT NOT NULL DEFAULT '',
      eligibility TEXT NOT NULL DEFAULT '',
      exclusions TEXT NOT NULL DEFAULT '',
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      steps JSONB NOT NULL DEFAULT '[]'::jsonb,
      agency TEXT NOT NULL DEFAULT '',
      apply_url TEXT NOT NULL DEFAULT '',
      timing TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      source_checked_at DATE,
      date_end DATE,
      status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      updated_by INTEGER REFERENCES users(id),
      reviewed_by INTEGER REFERENCES users(id),
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT benefit_measure_region_scope CHECK (
        (scope = 'federal' AND region_id IS NULL AND locality = '') OR
        (scope = 'regional' AND region_id IS NOT NULL)
      )
    )
  `);
  await pool.query("ALTER TABLE benefit_measures ADD COLUMN IF NOT EXISTS locality TEXT NOT NULL DEFAULT ''");
  await pool.query("ALTER TABLE benefit_measures ADD COLUMN IF NOT EXISTS match_rules JSONB NOT NULL DEFAULT '{}'::jsonb");
  await pool.query('ALTER TABLE benefit_measures ADD COLUMN IF NOT EXISTS date_end DATE');
  await pool.query('ALTER TABLE benefit_measures ADD COLUMN IF NOT EXISTS source_key TEXT');
  await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_benefit_measures_source_key ON benefit_measures (source_key)');
  await pool.query(`CREATE TABLE IF NOT EXISTS navigator_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    audience VARCHAR(30) NOT NULL,
    disability VARCHAR(10) NOT NULL,
    relationship VARCHAR(20) NOT NULL,
    children_count INTEGER NOT NULL,
    housing VARCHAR(30) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS navigator_routes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    measure_id BIGINT NOT NULL REFERENCES benefit_measures(id) ON DELETE CASCADE,
    selected_locality TEXT NOT NULL DEFAULT '',
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, measure_id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS navigator_completed_steps (
    user_id INTEGER NOT NULL,
    measure_id BIGINT NOT NULL,
    step_key CHAR(64) NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, measure_id, step_key),
    FOREIGN KEY (user_id, measure_id) REFERENCES navigator_routes(user_id, measure_id) ON DELETE CASCADE
  )`);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_benefit_measures_public
    ON benefit_measures (status, region_id, topic)
  `);
  for (const initial of INITIAL_MEASURES) {
    const { measure, error } = normalizeMeasure(initial);
    const publicationCheck = normalizeMeasure({ ...initial, date_end: null }, true);
    if (error || publicationCheck.error) throw new Error(`Invalid initial measure ${initial.source_key}: ${error || publicationCheck.error}`);
    await pool.query(
      `INSERT INTO benefit_measures
       (source_key, title, topic, scope, region_id, locality, audiences, summary, eligibility,
        exclusions, documents, steps, agency, apply_url, timing, source_url, source_checked_at,
        date_end, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'published',NOW())
       ON CONFLICT (source_key) DO NOTHING`,
      [initial.source_key, measure.title, measure.topic, measure.scope, measure.region_id,
        measure.locality, JSON.stringify(measure.audiences), measure.summary, measure.eligibility,
        measure.exclusions, JSON.stringify(measure.documents), JSON.stringify(measure.steps),
        measure.agency, measure.apply_url, measure.timing, measure.source_url,
        measure.source_checked_at, measure.date_end]
    );
    if (initial.match_rules) await pool.query(
      `UPDATE benefit_measures SET match_rules = $1 WHERE source_key = $2 AND updated_by IS NULL AND match_rules = '{}'::jsonb`,
      [JSON.stringify(initial.match_rules), initial.source_key]
    );
  }
  console.log('🎉 All tables and migrations completed successfully!');
}


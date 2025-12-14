# Инициализация базы данных

## Что добавлено

### 1. Модуль подключения к БД: `server/src/db/init.js`

Создан модуль, который:
- ✅ Подключается к PostgreSQL
- ✅ Создает таблицы автоматически при старте
- ✅ Логирует процесс инициализации
- ✅ Обрабатывает ошибки подключения

### 2. Схема базы данных

Создаются следующие таблицы:

#### `users` - Пользователи
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE) 
- full_name (VARCHAR)
- phone (VARCHAR)
- password_hash (VARCHAR)
- role (VARCHAR) - роль пользователя
- yandex_id (VARCHAR UNIQUE) - для OAuth
- created_at, updated_at (TIMESTAMP)
```

#### `requests` - Запросы пользователей
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK -> users.id)
- title (VARCHAR)
- description (TEXT)
- category (VARCHAR)
- status (VARCHAR) - pending, in_progress, completed, etc.
- created_at, updated_at (TIMESTAMP)
```

#### `ai_requests` - AI запросы
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK -> users.id)
- primary_prompt (TEXT) - вопрос
- secondary_response (TEXT) - ответ
- network_used (VARCHAR) - какая нейросеть использована
- created_at (TIMESTAMP)
```

### 3. Обновлен package.json

Добавлена зависимость `pg` (PostgreSQL клиент):
```json
"dependencies": {
  "express": "^4.18.2",
  "pg": "^8.11.3"
}
```

## Процесс инициализации

При запуске сервера:

1. **Подключение к БД**
   ```
   🔄 Connecting to database...
   ✅ Database connected: 2024-12-14T...
   ```

2. **Создание таблиц**
   ```
   🔄 Creating tables...
   ✅ Tables created successfully
   ```

3. **Проверка таблиц**
   ```
   📊 Database tables: users, requests, ai_requests
   ```

4. **Запуск сервера**
   ```
   ✅ Server is running on port 3001
   ✅ API URL: http://voensovet.ru:3001 or http://voensovet.ru/api
   ```

## Проверка работы

### После деплоя проверьте логи:

Должны увидеть:
```
=== Server Starting ===
DB_HOST: [SET]
DB_NAME: [SET]
DB_USER: [SET]
DB_PASSWORD: [SET]
======================
🔄 Connecting to database...
✅ Database connected: 2024-12-14...
🔄 Creating tables...
✅ Tables created successfully
📊 Database tables: users, requests, ai_requests
✅ Server is running on port 3001
```

### Проверка через psql:

Подключитесь к БД и проверьте таблицы:
```sql
-- Список таблиц
\dt

-- Должны увидеть:
-- users
-- requests
-- ai_requests

-- Структура таблицы users
\d users

-- Количество записей (должно быть 0 после первого запуска)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM requests;
SELECT COUNT(*) FROM ai_requests;
```

## Обновление переменных окружения

Обновите в панели Timeweb:

```env
# Обновите URL на новый домен
FRONTEND_URL=https://voensovet.ru
YANDEX_REDIRECT_URI=https://voensovet.ru/api/auth/yandex/callback

# Или если API на отдельном порту:
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback

# Frontend переменные (требуют пересборки)
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api
```

**⚠️ Важно**: После изменения `VITE_*` переменных нужно **пересобрать фронтенд**:
```bash
git add .
git commit -m "Update API URLs to voensovet.ru"
git push
```

## Что делать дальше

### 1. Закоммитьте изменения:
```bash
git add server/src/db/init.js
git add server/src/index.js
git add server/package.json
git commit -m "Add database initialization with table creation"
git push
```

### 2. Обновите переменные в Timeweb:
- `FRONTEND_URL=https://voensovet.ru`
- `YANDEX_REDIRECT_URI=https://voensovet.ru/api/auth/yandex/callback`
- `VITE_API_URL=https://voensovet.ru:3001`
- `VITE_API_BASE_URL=https://voensovet.ru:3001/api`

### 3. Переразверните приложение

### 4. Проверьте логи

Должны увидеть успешную инициализацию БД.

### 5. Проверьте таблицы в БД

Подключитесь к PostgreSQL и убедитесь, что таблицы созданы.

## Устранение проблем

### Проблема: "Database connection error"

**Проверьте:**
1. `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` установлены корректно
2. БД доступна из контейнера Docker
3. Порт БД открыт (обычно 5432)
4. Пользователь БД имеет права на создание таблиц

### Проблема: "permission denied to create table"

**Решение:** Дайте пользователю БД права на создание таблиц:
```sql
GRANT CREATE ON DATABASE your_db_name TO your_db_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO your_db_user;
```

### Проблема: Таблицы не создаются

**Проверьте логи:**
- Если есть ошибка SQL - проверьте синтаксис в `server/src/db/init.js`
- Если ошибка подключения - проверьте переменные окружения
- Если timeout - увеличьте `connectionTimeoutMillis` в pool config

## API для работы с БД

После инициализации можно добавлять маршруты для работы с данными:

```javascript
// Пример: получить всех пользователей
app.get('/api/users', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Пример: создать пользователя
app.post('/api/users', async (req, res) => {
  try {
    const { email, full_name, phone } = req.body;
    const result = await query(
      'INSERT INTO users (email, full_name, phone) VALUES ($1, $2, $3) RETURNING *',
      [email, full_name, phone]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Миграции (для будущих изменений)

Для изменения схемы БД в будущем создайте папку `server/src/db/migrations/` и добавляйте SQL файлы:

```
server/src/db/migrations/
  - 001_initial_schema.sql
  - 002_add_user_roles.sql
  - 003_add_requests_table.sql
```

Это позволит отслеживать изменения схемы и применять их последовательно.


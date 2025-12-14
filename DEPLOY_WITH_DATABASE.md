# Финальный деплой с инициализацией базы данных

## ✅ Что добавлено

### 1. Инициализация БД при старте сервера
- Файл: `server/src/db/init.js`
- Автоматическое создание таблиц: `users`, `requests`, `ai_requests`
- Подключение к PostgreSQL с обработкой ошибок

### 2. CORS middleware
- Разрешен доступ с `https://voensovet.ru`
- Настроены заголовки для API запросов

### 3. Обновлены URL
- Frontend: `https://voensovet.ru`
- API: `https://voensovet.ru:3001` или `https://voensovet.ru/api`

## 📋 Чеклист перед деплоем

### 1. Обновите переменные окружения в Timeweb:

```env
# Обновите на новый домен
FRONTEND_URL=https://voensovet.ru
YANDEX_REDIRECT_URI=https://voensovet.ru/api/auth/yandex/callback

# Для фронтенда (требует пересборки!)
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api
```

**⚠️ Важно**: Если API настроен через nginx proxy на `/api`, используйте:
```env
VITE_API_URL=https://voensovet.ru/api
VITE_API_BASE_URL=https://voensovet.ru/api
```

### 2. Обновите настройки Yandex OAuth

В консоли Yandex OAuth обновите Callback URL:
```
https://voensovet.ru/api/auth/yandex/callback
```
Или:
```
https://voensovet.ru:3001/api/auth/yandex/callback
```

### 3. Закоммитьте изменения:

```bash
git add server/src/db/init.js
git add server/src/index.js
git add server/package.json
git add docker-compose.yml
git commit -m "Add database initialization and CORS support"
git push
```

### 4. Переразверните на Timeweb

## 🔍 Проверка после деплоя

### В логах должно быть:

```
=== Server Starting ===
PORT: 3001
NODE_ENV: production
DB_HOST: [SET]
DB_NAME: [SET]
DB_USER: [SET]
DB_PASSWORD: [SET]
======================
🔄 Connecting to database...
✅ Database connected: 2024-12-14T20:15:32.123Z
🔄 Creating tables...
✅ Tables created successfully
📊 Database tables: users, requests, ai_requests
✅ Server is running on port 3001
✅ API URL: http://voensovet.ru:3001 or http://voensovet.ru/api
```

### Проверьте API:

```bash
# Health check
curl https://voensovet.ru:3001/health

# Debug info
curl https://voensovet.ru:3001/debug/env
```

### Проверьте БД:

Подключитесь к PostgreSQL:
```bash
psql -h 147.45.213.154 -U your_user -d your_db_name
```

Проверьте таблицы:
```sql
-- Список таблиц
\dt

-- Должны увидеть:
-- public | users        | table
-- public | requests     | table
-- public | ai_requests  | table

-- Проверка структуры
\d users
\d requests
\d ai_requests
```

## ⚠️ Если БД не инициализируется

### Проверьте права пользователя БД:

```sql
-- Подключитесь как суперпользователь
psql -h 147.45.213.154 -U postgres

-- Дайте права пользователю
GRANT CREATE ON DATABASE your_db_name TO your_db_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
```

### Проверьте подключение:

```bash
# Из контейнера
docker exec <api-container-id> wget --spider http://147.45.213.154:5432

# Из хоста
telnet 147.45.213.154 5432
```

### Если порт 5432 не указан:

Обновите переменную в Timeweb:
```env
DB_PORT=5432
```

## 🚀 Порядок запуска

1. **Docker Compose** запускает оба контейнера
2. **API контейнер**:
   - Запуск Express
   - Подключение к PostgreSQL
   - Создание таблиц (если не существуют)
   - Запуск на порту 3001
3. **Web контейнер**:
   - Запуск nginx
   - Раздача статики на порту 8080

## 📊 Структура проекта после изменений

```
server/
├── Dockerfile
├── package.json (с pg зависимостью)
├── .dockerignore
└── src/
    ├── index.js (с инициализацией БД)
    ├── db/
    │   └── init.js ✨ (новый файл)
    ├── routes/
    └── middleware/
```

## 🎯 Следующие шаги

После успешной инициализации БД:

1. **Добавьте маршруты** в `server/src/routes/`
2. **Добавьте middleware** для аутентификации в `server/src/middleware/`
3. **Создайте API endpoints** для работы с пользователями, запросами, AI
4. **Настройте Yandex OAuth** для авторизации
5. **Интегрируйте AI сервис** для обработки запросов

## 📝 Итого

После этого деплоя:
- ✅ Сервер запустится
- ✅ Подключится к БД
- ✅ Создаст таблицы автоматически
- ✅ Логи покажут успешную инициализацию
- ✅ БД будет готова к работе

**Закоммитьте изменения и переразверните приложение!**


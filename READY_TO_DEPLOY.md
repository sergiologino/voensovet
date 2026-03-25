# 🚀 Готово к деплою с инициализацией БД

## ✅ Что сделано

### 1. База данных будет инициализироваться автоматически!
- **Файл**: `server/src/db/init.js`
- Создает таблицы: `users`, `requests`, `ai_requests`
- Подключение к PostgreSQL
- Обработка ошибок

### 2. CORS настроен
- Разрешен доступ с `https://voensovet.ru`
- Фронтенд сможет делать запросы к API

### 3. Обновлены URL
- Frontend: `https://voensovet.ru`
- API: `https://voensovet.ru:3001`

## 📝 ЧТО НУЖНО СДЕЛАТЬ ПЕРЕД ДЕПЛОЕМ

### 1. Обновите переменные в панели Timeweb:

```env
# Обязательно обновите эти URL
FRONTEND_URL=https://voensovet.ru
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback

# Для фронтенда (ВАЖНО - это требует пересборки!)
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api

# Убедитесь что DB_PORT установлен (если был пустым)
DB_PORT=5432
```

### 2. Обновите Yandex OAuth настройки:

В консоли Yandex OAuth измените Callback URL на:
```
https://voensovet.ru:3001/api/auth/yandex/callback
```

### 3. Закоммитьте ВСЕ изменения:

```bash
cd E:\1_MyProjects\VOEBSOVET_RU\app2

git add server/src/db/init.js
git add server/src/index.js
git add server/package.json
git add docker-compose.yml

git commit -m "Add database initialization on server startup"
git push
```

### 4. Переразверните на Timeweb

## 🔍 Что произойдет после деплоя

### В логах увидите:

```
=== Server Starting ===
PORT: 3001
NODE_ENV: production
DB_HOST: [SET]
DB_PORT: [SET]
DB_NAME: [SET]
DB_USER: [SET]
DB_PASSWORD: [SET]
...все остальные переменные...
======================
🔄 Connecting to database...
✅ Database connected: 2024-12-14T20:15:32.123Z
🔄 Creating tables...
✅ Tables created successfully
📊 Database tables: users, requests, ai_requests
✅ Server is running on port 3001
✅ Environment: production
✅ Health check: http://localhost:3001/health
✅ API URL: http://voensovet.ru:3001 or http://voensovet.ru/api
```

### В базе данных появятся таблицы:

```sql
-- Проверьте в psql:
\dt

-- Результат:
public | users        | table
public | requests     | table  
public | ai_requests  | table
```

## 🎯 Проверка работы

### 1. Откройте фронтенд:
```
https://voensovet.ru
```

### 2. Проверьте API:
```bash
# Health check
curl https://voensovet.ru:3001/health

# Должен вернуть статус БД
{
  "status": "ok",
  "database": {
    "host": true,
    "port": true,
    "name": true,
    "user": true,
    "password": true
  }
}
```

### 3. Проверьте БД:
```bash
psql -h 147.45.213.154 -U your_user -d your_db_name

\dt  # Список таблиц
SELECT COUNT(*) FROM users;  # Должно быть 0 после первого запуска
```

## ⚠️ Если возникнут проблемы

### Проблема: "Database connection error"

**В логах увидите:**
```
❌ Database connection error: ...
⚠️ Database initialization failed, but server will start anyway
✅ Server is running on port 3001
```

**Решение:**
1. Проверьте что `DB_PORT=5432` установлен
2. Проверьте доступность БД: `telnet 147.45.213.154 5432`
3. Проверьте права пользователя БД
4. Проверьте что БД создана: `SELECT 1;`

### Проблема: "permission denied to create table"

**Решение:** Дайте права пользователю:
```sql
-- Подключитесь как postgres
psql -h 147.45.213.154 -U postgres

GRANT CREATE ON DATABASE your_db_name TO your_db_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO your_db_user;
```

### Проблема: Таблицы не создаются

**Проверьте логи:**
- Есть ли ошибки SQL?
- Пользователь имеет права?
- Переменные `DB_*` установлены правильно?

## 🎉 После успешного деплоя

### Что будет работать:
- ✅ Frontend на https://voensovet.ru
- ✅ API на https://voensovet.ru:3001
- ✅ База данных с таблицами
- ✅ Health check работает
- ✅ CORS настроен

### Следующие шаги:
1. Добавить API endpoints для работы с пользователями
2. Настроить аутентификацию (JWT)
3. Подключить Yandex OAuth
4. Интегрировать AI сервис
5. Добавить функциональность запросов

## 📚 Полезные команды

### Проверка контейнеров:
```bash
docker ps  # Должны быть api-1 и web-1
docker logs <container-id>  # Логи контейнера
```

### Проверка БД:
```bash
psql -h 147.45.213.154 -U your_user -d your_db_name

\dt  # Список таблиц
\d users  # Структура таблицы users
SELECT * FROM users LIMIT 10;  # Данные
```

### Проверка API:
```bash
curl https://voensovet.ru:3001/health
curl https://voensovet.ru:3001/debug/env
curl https://voensovet.ru:3001/
```

## 🔒 Безопасность

После проверки **удалите** debug endpoint из `server/src/index.js`:
```javascript
// Удалите этот код:
app.get('/debug/env', ...);
```

И закоммитьте:
```bash
git add server/src/index.js
git commit -m "Remove debug endpoint"
git push
```

---

**Все готово к деплою! Закоммитьте и разверните приложение.**



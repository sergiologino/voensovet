# Финальный чеклист деплоя на Timeweb

## Что было исправлено

### 1. ✅ Передача переменных окружения
- **Проблема**: Переменные из Timeweb не передавались в контейнеры
- **Решение**: Использован синтаксис `${VARIABLE}` в `docker-compose.yml`

### 2. ✅ Порт бэкенда изменен на 3001
- **Проблема**: Порт был 3000, а в настройках Timeweb 3001
- **Решение**: Изменен порт на `${PORT:-3001}` (динамический)

### 3. ✅ Порядок запуска
- **Проблема**: Фронтенд мог запуститься раньше бэкенда
- **Решение**: Добавлен `depends_on` с проверкой `service_healthy`

### 4. ✅ Логирование переменных
- Добавлены логи старта сервера
- Добавлен debug endpoint `/debug/env`

## Переменные окружения в Timeweb

Добавьте эти переменные в панели Timeweb APP Platform:

```env
# Обязательные для бэкенда
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-long-secret-key-here

# Опциональные для бэкенда
API_KEY=your-api-key-if-needed

# Для фронтенда (с префиксом VITE_)
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api
```

## Порядок запуска контейнеров

1. **Docker Compose** читает переменные из окружения хоста (Timeweb)
2. **API контейнер**:
   - Сборка: `server/Dockerfile`
   - Запуск с переменными: `PORT=3001`, `DATABASE_URL`, `JWT_SECRET`
   - Health check на `/health`
3. **Web контейнер** (запускается ПОСЛЕ успешного health check API):
   - Сборка: корневой `Dockerfile`
   - Переменные `VITE_*` встраиваются в код во время сборки

## Структура проекта

```
project/
├── Dockerfile                    # Фронтенд
├── docker-compose.yml            # Оба сервиса
├── package.json                  # Фронтенд зависимости
├── src/                          # Фронтенд код
└── server/
    ├── Dockerfile                # Бэкенд
    ├── package.json              # Бэкенд зависимости (Express)
    └── src/
        └── index.js              # Точка входа (порт 3001)
```

## Чеклист перед деплоем

### 1. Проверьте файлы

- [ ] `docker-compose.yml` - переменные с синтаксисом `${VARIABLE}`
- [ ] `server/package.json` - существует и содержит Express
- [ ] `server/src/index.js` - использует `process.env.PORT`
- [ ] `server/Dockerfile` - копирует `src/` и устанавливает зависимости

### 2. Настройки в Timeweb

- [ ] Переменная `PORT=3001` добавлена
- [ ] Переменная `DATABASE_URL` добавлена (если нужна БД)
- [ ] Переменная `JWT_SECRET` добавлена
- [ ] Переменные `VITE_*` добавлены (для фронтенда)

### 3. Git

```bash
git add .
git commit -m "Fix Timeweb deployment: pass env vars correctly"
git push
```

### 4. Переразверните приложение

В панели Timeweb нажмите "Переразвернуть" или сделайте новый push в git.

## Проверка работы

### В логах Timeweb вы увидите:

```
=== Server Starting ===
PORT: 3001
NODE_ENV: production
DATABASE_URL: [SET]
JWT_SECRET: [SET]
======================
✅ Server is running on port 3001
✅ Environment: production
✅ Health check: http://localhost:3001/health
```

### Тестирование endpoints:

1. **Health check API**:
   ```bash
   curl http://your-app:3001/health
   ```
   
   Ожидаемый ответ:
   ```json
   {
     "status": "ok",
     "port": 3001,
     "env": "production",
     "hasDatabase": true
   }
   ```

2. **Debug info** (для проверки переменных):
   ```bash
   curl http://your-app:3001/debug/env
   ```
   
   Ожидаемый ответ:
   ```json
   {
     "port": "3001",
     "nodeEnv": "production",
     "hasDatabase": true,
     "hasJwtSecret": true,
     "hasApiKey": false
   }
   ```

3. **Frontend**:
   ```bash
   curl http://your-app:8080
   ```

## Если БД не создается

### Проверьте переменную DATABASE_URL:

1. В логах должно быть `DATABASE_URL: [SET]`
2. Проверьте формат: `postgresql://user:password@host:5432/dbname`
3. Убедитесь, что БД доступна из контейнера

### Добавьте код подключения к БД:

В `server/src/index.js` добавьте:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Тест подключения
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
});
```

И добавьте `pg` в `server/package.json`:
```json
"dependencies": {
  "express": "^4.18.2",
  "pg": "^8.11.3"
}
```

## Безопасность

После успешного деплоя **УДАЛИТЕ** debug endpoint:
```javascript
// Удалите этот endpoint:
app.get('/debug/env', ...);
```

## Альтернатива: Разделить приложения

Если проблемы продолжаются, создайте **два отдельных приложения** на Timeweb:

### Приложение 1: Backend
- Git repo: `https://github.com/sergiologino/voensovet.git`
- Dockerfile: `server/Dockerfile`
- Контекст сборки: `server/`
- Порт: 3001
- Переменные: `PORT`, `DATABASE_URL`, `JWT_SECRET` и т.д.

### Приложение 2: Frontend
- Git repo: `https://github.com/sergiologino/voensovet.git`
- Dockerfile: корневой `Dockerfile`
- Порт: 8080
- Переменные: `VITE_API_URL=https://backend-app-url.com`

Это **рекомендуемый** подход для production.


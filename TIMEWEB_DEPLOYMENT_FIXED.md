# Исправление деплоя на Timeweb - Передача переменных окружения

## Проблема

Бэкенд не получает переменные окружения из настроек Timeweb, потому что:
1. В `docker-compose.yml` переменные были жестко заданы
2. Не использовался синтаксис `${VARIABLE}` для чтения с хоста

## Что исправлено

### 1. docker-compose.yml

**Было**:
```yaml
api:
  environment:
    - NODE_ENV=production  # Жестко задано
```

**Стало**:
```yaml
api:
  ports:
    - "${PORT:-3001}:${PORT:-3001}"  # Динамический порт
  environment:
    - NODE_ENV=${NODE_ENV:-production}
    - PORT=${PORT:-3001}
    - DATABASE_URL=${DATABASE_URL}
    - JWT_SECRET=${JWT_SECRET}
    - API_KEY=${API_KEY}
```

### 2. Порядок запуска

Добавлен `depends_on` с проверкой health check:
```yaml
web:
  depends_on:
    api:
      condition: service_healthy
```

Теперь фронтенд запустится **ПОСЛЕ** того, как бэкенд пройдет health check.

### 3. Логирование в server/src/index.js

Добавлены логи для отладки:
```javascript
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
```

## Переменные окружения в панели Timeweb

Добавьте следующие переменные в настройках приложения:

### Обязательные для бэкенда:
```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-here
```

### Опциональные для бэкенда:
```
API_KEY=your-api-key
```

### Для фронтенда (с префиксом VITE_):
```
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api
```

## Порядок запуска

1. **Docker Compose читает переменные** из окружения хоста (Timeweb)
2. **Сборка api контейнера** (`server/Dockerfile`)
3. **Запуск api контейнера** с переменными окружения
4. **Health check api** (`/health` endpoint)
5. **Сборка web контейнера** (корневой `Dockerfile`)
6. **Запуск web контейнера** после успешного health check api

## Проверка работы

### В логах Timeweb вы должны увидеть:

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

### Debug endpoints:

1. **Health check**:
   ```bash
   curl http://your-app:3001/health
   ```
   
   Ответ:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-...",
     "port": 3001,
     "env": "production",
     "hasDatabase": true
   }
   ```

2. **Debug info** (удалите после проверки):
   ```bash
   curl http://your-app:3001/debug/env
   ```
   
   Ответ:
   ```json
   {
     "port": "3001",
     "nodeEnv": "production",
     "hasDatabase": true,
     "hasJwtSecret": true
   }
   ```

## Что делать если переменные все еще не передаются

### Вариант 1: Использовать env_file

Создайте `.env` файл локально (НЕ коммитьте в git):
```env
PORT=3001
DATABASE_URL=...
JWT_SECRET=...
```

В `docker-compose.yml`:
```yaml
api:
  env_file:
    - .env
```

### Вариант 2: Разделить приложения

Создайте **два отдельных приложения** на Timeweb:

1. **Backend App**:
   - Dockerfile: `server/Dockerfile`
   - Контекст: `server/`
   - Порт: 3001
   - Переменные окружения задаются в настройках этого приложения

2. **Frontend App**:
   - Dockerfile: корневой `Dockerfile`
   - Порт: 8080
   - Переменная `VITE_API_URL` указывает на URL бэкенда

Это **рекомендуемый** подход для production.

## Чеклист перед деплоем

- [ ] Переменные окружения добавлены в панели Timeweb
- [ ] PORT установлен в 3001
- [ ] DATABASE_URL корректен
- [ ] JWT_SECRET установлен
- [ ] Изменения закоммичены в git:
  ```bash
  git add docker-compose.yml server/
  git commit -m "Fix environment variables passing from Timeweb"
  git push
  ```
- [ ] Переразвернуто приложение на Timeweb

## Важно

После успешного деплоя **удалите** debug endpoint `/debug/env` из `server/src/index.js` для безопасности.


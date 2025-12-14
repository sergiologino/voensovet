# Полный список переменных окружения для Timeweb

## Настройка в панели Timeweb APP Platform

Добавьте все эти переменные в разделе "Переменные окружения":

### Database (PostgreSQL)
```env
DB_HOST=147.45.213.154
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### JWT Authentication
```env
JWT_SECRET=your-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### Yandex OAuth
```env
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret
YANDEX_REDIRECT_URI=https://sergiologino-voensovet-1e9f.twc1.net/api/auth/yandex/callback
```

### AI Service Integration
```env
AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
AI_SERVICE_API_KEY=5DDE26C2196CB9FA56A4DF5B466C7E2D2C1FA62BA10BDA1B
```

### Application Settings
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://sergiologino-voensovet-1e9f.twc1.net
```

### Frontend Build Variables (с префиксом VITE_)
```env
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api
```

## Проверка переменных

### В логах сервера при старте увидите:

```
=== Server Starting ===
PORT: 3001
NODE_ENV: production
DB_HOST: [SET]
DB_PORT: [SET]
DB_NAME: [SET]
DB_USER: [SET]
DB_PASSWORD: [SET]
JWT_SECRET: [SET]
JWT_EXPIRES_IN: [SET]
YANDEX_CLIENT_ID: [SET]
YANDEX_CLIENT_SECRET: [SET]
YANDEX_REDIRECT_URI: [SET]
AI_SERVICE_URL: [SET]
AI_SERVICE_API_KEY: [SET]
FRONTEND_URL: [SET]
======================
```

### Тест через API:

```bash
# Health check с информацией о настройках
curl http://your-app:3001/health
```

Ответ:
```json
{
  "status": "ok",
  "port": 3001,
  "env": "production",
  "database": {
    "host": true,
    "port": true,
    "name": true,
    "user": true,
    "password": true
  },
  "services": {
    "yandexOAuth": true,
    "aiService": true
  }
}
```

### Debug endpoint (удалите после проверки):

```bash
curl http://your-app:3001/debug/env
```

Ответ покажет, какие переменные установлены (true/false):
```json
{
  "port": "3001",
  "nodeEnv": "production",
  "database": {
    "host": true,
    "port": true,
    "name": true,
    "user": true,
    "password": true
  },
  "jwt": {
    "secret": true,
    "expiresIn": true
  },
  "yandex": {
    "clientId": true,
    "clientSecret": true,
    "redirectUri": true
  },
  "aiService": {
    "url": true,
    "apiKey": true
  },
  "frontendUrl": true
}
```

## Важные замечания

### 1. DB_PORT
Если оставите пустым в Timeweb, используйте стандартный порт PostgreSQL `5432` в коде.

### 2. Безопасность
- Никогда не коммитьте переменные в git
- Не используйте простые пароли
- JWT_SECRET должен быть длинным и случайным (минимум 32 символа)

### 3. URL endpoints
Убедитесь, что URL правильные:
- `YANDEX_REDIRECT_URI` должен совпадать с настройками в Yandex OAuth
- `AI_SERVICE_URL` должен быть доступен из контейнера
- `FRONTEND_URL` используется для CORS

## Подключение к базе данных

В вашем коде сервера используйте эти переменные:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Тест подключения
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});
```

## Если переменные не работают

### 1. Проверьте синтаксис в docker-compose.yml
```yaml
environment:
  - DB_HOST=${DB_HOST}  # ✅ Правильно
  - DB_HOST=hardcoded   # ❌ Неправильно (жестко задано)
```

### 2. Проверьте имена переменных
Имена должны **точно совпадать** в:
- Панели Timeweb
- docker-compose.yml
- Коде приложения (process.env.DB_HOST)

### 3. Перезапустите приложение
После добавления переменных в Timeweb нужно переразвернуть приложение.

### 4. Проверьте логи
В логах Timeweb должны быть все переменные отмечены как `[SET]`.

## Чеклист перед деплоем

- [ ] Все переменные добавлены в панели Timeweb
- [ ] DB_HOST, DB_NAME, DB_USER, DB_PASSWORD установлены
- [ ] JWT_SECRET установлен (длинный случайный ключ)
- [ ] YANDEX_* переменные совпадают с настройками OAuth
- [ ] AI_SERVICE_URL и AI_SERVICE_API_KEY правильные
- [ ] Изменения закоммичены:
  ```bash
  git add docker-compose.yml server/src/index.js
  git commit -m "Add all environment variables"
  git push
  ```
- [ ] Приложение переразвернуто на Timeweb


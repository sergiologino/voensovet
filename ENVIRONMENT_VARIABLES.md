# Переменные окружения

Приложение использует переменные окружения для конфигурации. Все переменные должны быть установлены на сервере перед запуском.

## Backend (Node.js сервер)

### База данных PostgreSQL

| Переменная | Дефолт | Описание |
|-----------|--------|----------|
| `DB_HOST` | `localhost` | Хост PostgreSQL сервера |
| `DB_PORT` | `5432` | Порт PostgreSQL сервера |
| `DB_NAME` | `voensovet_db` | Имя базы данных |
| `DB_USER` | `voensovet_user` | Имя пользователя БД |
| `DB_PASSWORD` | `voensovet_password` | Пароль пользователя БД |

**Пример:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=voensovet_user
DB_PASSWORD=your_secure_password
```

### JWT (JSON Web Tokens)

| Переменная | Дефолт | Описание |
|-----------|--------|----------|
| `JWT_SECRET` | *(обязательно)* | Секретный ключ для подписи JWT токенов. Должен быть длинной случайной строкой (минимум 32 символа). **ВАЖНО:** Используйте уникальный секретный ключ в продакшене! |
| `JWT_EXPIRES_IN` | `7d` | Время жизни JWT токена. Формат: `7d` (7 дней), `24h` (24 часа), `3600s` (1 час) |

**Пример:**
```bash
JWT_SECRET=your-very-long-and-random-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
```

### OAuth Yandex

| Переменная | Дефолт | Описание |
|-----------|--------|----------|
| `YANDEX_CLIENT_ID` | *(обязательно)* | Client ID приложения Yandex OAuth. Получить на https://oauth.yandex.ru/ |
| `YANDEX_CLIENT_SECRET` | *(обязательно)* | Client Secret приложения Yandex OAuth |
| `YANDEX_REDIRECT_URI` | *(обязательно)* | URL для callback OAuth. Должен совпадать с настройками в Yandex OAuth. Формат: `https://your-domain.com/api/auth/yandex/callback` |

**Пример:**
```bash
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret
YANDEX_REDIRECT_URI=https://sergiologino-voensovet-1e9f.twc1.net/api/auth/yandex/callback
```

### AI Integration Service

| Переменная | Дефолт | Описание |
|-----------|--------|----------|
| `AI_SERVICE_URL` | `https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net` | URL сервиса AI интеграции |
| `AI_SERVICE_API_KEY` | *(обязательно)* | API ключ для доступа к AI сервису. Получить после регистрации клиентского приложения в AI сервисе |

**Пример:**
```bash
AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
AI_SERVICE_API_KEY=your-api-key-from-ai-service
```

### Сервер

| Переменная | Дефолт | Описание |
|-----------|--------|----------|
| `PORT` | `3001` | Порт, на котором будет запущен backend сервер |
| `NODE_ENV` | `development` | Режим работы: `development` или `production`. В production включаются дополнительные проверки безопасности |
| `FRONTEND_URL` | `http://localhost:5173` | URL фронтенд приложения. Используется для CORS и OAuth редиректов. **ВАЖНО:** Для локальной разработки используйте `http://localhost:5173` (не `https://`). Для продакшена: `https://your-domain.com` |

**Пример для локальной разработки:**
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Пример для продакшена:**
```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://sergiologino-voensovet-1e9f.twc1.net
```

## Frontend (React/Vite)

### API

| Переменная | Дефолт | Описание |
|-----------|--------|----------|
| `VITE_API_URL` | `http://localhost:3001` | URL backend API сервера. Для продакшена: `https://your-backend-domain.com` |

**Пример:**
```bash
VITE_API_URL=https://your-backend-domain.com
```

**Примечание:** В Vite переменные окружения должны начинаться с `VITE_` чтобы быть доступными в клиентском коде.

## Полный пример для продакшена

### Backend (.env или переменные окружения на сервере)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=voensovet_user
DB_PASSWORD=secure_password_here

# JWT
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# OAuth Yandex
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret
YANDEX_REDIRECT_URI=https://sergiologino-voensovet-1e9f.twc1.net/api/auth/yandex/callback

# AI Service
AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
AI_SERVICE_API_KEY=your-api-key-from-ai-service

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://sergiologino-voensovet-1e9f.twc1.net
```

### Frontend (переменные окружения при сборке)

```bash
VITE_API_URL=https://your-backend-domain.com
```

## Установка переменных окружения

### Linux/Unix (systemd, PM2, Docker)

```bash
# Для systemd service
sudo nano /etc/systemd/system/voensovet-backend.service
# Добавьте Environment= переменные в секцию [Service]

# Для PM2
pm2 start server/src/index.js --name voensovet-backend --env production

# Для Docker
docker run -e DB_HOST=... -e DB_PORT=... ... your-image

# Или через .env файл (если используете docker-compose)
docker-compose up
```

### Windows

```powershell
# В PowerShell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
# и т.д.

# Или через системные переменные окружения
# Панель управления -> Система -> Дополнительные параметры системы -> Переменные среды
```

## Проверка переменных

После установки переменных проверьте, что они доступны:

```bash
# Linux/Unix
echo $DB_HOST
echo $JWT_SECRET

# Windows PowerShell
echo $env:DB_HOST
echo $env:JWT_SECRET
```

## Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте секретные ключи в Git
- Используйте сильные случайные пароли для `JWT_SECRET` (минимум 32 символа)
- В продакшене используйте `NODE_ENV=production`
- Ограничьте доступ к переменным окружения только необходимым процессам
- Регулярно ротируйте секретные ключи

## Генерация JWT_SECRET

```bash
# Linux/Unix
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Онлайн генератор
# https://www.grc.com/passwords.htm (используйте 64-символьный пароль)
```




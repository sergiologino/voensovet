# ✅ ПРАВИЛЬНЫЕ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ДЛЯ TIMEWEB

## 🚨 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ

### ❌ НЕПРАВИЛЬНО (сейчас):
```env
VITE_API_URL=https://voensovet.ru/server
```

### ✅ ПРАВИЛЬНО (нужно исправить):
```env
VITE_API_URL=https://voensovet.ru:3001
```

---

## 📋 ПОЛНЫЙ СПИСОК ПЕРЕМЕННЫХ ДЛЯ TIMEWEB

Скопируйте эти переменные в настройки сервера Timeweb:

```env
# ============================================
# БАЗА ДАННЫХ
# ============================================
DB_HOST=147.45.213.154
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=postgres_voensovet
DB_PASSWORD=postgres_voensovet

# ============================================
# JWT ТОКЕНЫ
# ============================================
JWT_SECRET=35bh63vh6hj6hj6ljh46gh45g6l4g6kl45g6l
JWT_EXPIRES_IN=7d

# ============================================
# YANDEX OAUTH
# ============================================
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback

# ============================================
# AI СЕРВИС
# ============================================
AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
AI_SERVICE_API_KEY=5DDE26C2196CB9FA56A4DF5B466C7E2D2C1FA62BA10BDA1B

# ============================================
# СЕРВЕР (BACKEND)
# ============================================
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://voensovet.ru

# ============================================
# ФРОНТЕНД (VITE) - ВАЖНО!
# ============================================
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api
```

---

## 🔍 ОБЪЯСНЕНИЕ ИЗМЕНЕНИЙ

### 1. **VITE_API_URL**
- ❌ **Было**: `https://voensovet.ru/server`
- ✅ **Стало**: `https://voensovet.ru:3001`
- **Почему**: Backend работает на порту 3001, а не на маршруте `/server`

### 2. **VITE_API_BASE_URL**
- ✅ **Добавлено**: `https://voensovet.ru:3001/api`
- **Почему**: Нужно для API запросов с префиксом `/api`

### 3. **YANDEX_REDIRECT_URI**
- ❌ **Было**: `https://voensovet.ru/api/auth/yandex/callback`
- ✅ **Стало**: `https://voensovet.ru:3001/api/auth/yandex/callback`
- **Почему**: OAuth callback должен идти на backend (порт 3001)

---

## 🎯 АРХИТЕКТУРА ПРИЛОЖЕНИЯ

```
┌─────────────────────────────────────────────┐
│  voensovet.ru (порт 80/443)                 │
│  Frontend (Nginx)                            │
│  ↓ обращается к →                            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  voensovet.ru:3001                          │
│  Backend API (Node.js/Express)              │
│  - /health                                   │
│  - /api/auth/...                            │
│  - /api/users/...                           │
│  - /api/requests/...                        │
│  ↓ обращается к →                           │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  147.45.213.154:5432                        │
│  PostgreSQL Database                        │
└─────────────────────────────────────────────┘
```

---

## 📦 ПОРЯДОК РАЗВЕРТЫВАНИЯ

Docker Compose автоматически соблюдает правильный порядок:

1. **Шаг 1**: Сборка `api` (Backend)
   - Dockerfile: `server/Dockerfile`
   - Порт: 3001
   - Инициализирует БД при старте

2. **Шаг 2**: Сборка `web` (Frontend)
   - Dockerfile: `Dockerfile` (корневой)
   - Порт: 80 (внутри контейнера) → 8080 (снаружи)
   - Зависит от `api` (`depends_on: - api`)

3. **Шаг 3**: Запуск контейнеров
   - Сначала запускается `api`
   - Потом запускается `web`

---

## 🚀 ЧТО ДЕЛАТЬ ДАЛЬШЕ

### 1. Обновите переменные в Timeweb
Зайдите в настройки сервера и **измените**:
- `VITE_API_URL` → `https://voensovet.ru:3001`
- Добавьте `VITE_API_BASE_URL` → `https://voensovet.ru:3001/api`
- `YANDEX_REDIRECT_URI` → `https://voensovet.ru:3001/api/auth/yandex/callback`

### 2. Удалите package-lock.json из Git
```bash
git rm package-lock.json
git rm server/package-lock.json
git commit -m "Remove package-lock.json, use npm install in Docker"
```

### 3. Закоммитьте изменения
```bash
git add Dockerfile .gitignore CORRECT_ENV_VARS.md
git commit -m "Fix: Use npm install instead of npm ci, update URL config"
git push
```

### 4. Timeweb автоматически задеплоит

---

## ✅ ПОСЛЕ ДЕПЛОЯ

Проверьте логи на наличие:

```
=== Server Starting ===
PORT: 3001
✅ Database connected
✅ Tables created successfully
📊 Database tables: users, requests, ai_requests
✅ Server is running on port 3001
```

Проверьте endpoint'ы:
- https://voensovet.ru (Frontend)
- https://voensovet.ru:3001/health (Backend health check)

---

## 🆘 ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ

1. Проверьте логи деплоя в Timeweb
2. Убедитесь, что порт 3001 открыт в firewall
3. Проверьте, что переменные окружения сохранены в Timeweb
4. Проверьте подключение к БД: `psql -h 147.45.213.154 -U postgres_voensovet -d voensovet_db`


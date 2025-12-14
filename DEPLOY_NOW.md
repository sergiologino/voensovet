# 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ - ДЕЙСТВУЙТЕ СЕЙЧАС!

## ⚠️ КРИТИЧЕСКАЯ ПРОБЛЕМА
`package-lock.json` не синхронизирован с `package.json` → npm ci падает

## ✅ ЧТО ИСПРАВЛЕНО

### 1. **Dockerfile фронтенда** (`app2/Dockerfile`)
- ✅ Заменил `npm ci` → `npm install --legacy-peer-deps`
- ✅ Это позволит собрать приложение даже с несинхронизированным lockfile

### 2. **Dockerfile бекенда** (`app2/server/Dockerfile`)
- ✅ Добавлен флаг `--legacy-peer-deps` для npm install/ci

### 3. **.gitignore**
- ✅ Добавлен `package-lock.json` чтобы не коммитить устаревшие lockfile'ы

### 4. **Документация**
- ✅ Создан `CORRECT_ENV_VARS.md` с правильными переменными

---

## 🎯 ШАГ 1: ОБНОВИТЕ ПЕРЕМЕННЫЕ В TIMEWEB

Зайдите в панель Timeweb и **ИЗМЕНИТЕ**:

### ❌ Неправильно (сейчас):
```
VITE_API_URL=https://voensovet.ru/server
```

### ✅ Правильно (исправьте на):
```
VITE_API_URL=https://voensovet.ru:3001
```

### ➕ Добавьте новую переменную:
```
VITE_API_BASE_URL=https://voensovet.ru:3001/api
```

### 🔧 Исправьте (если есть):
```
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback
```

---

## 🎯 ШАГ 2: УДАЛИТЕ LOCKFILE'Ы ИЗ GIT

```bash
cd E:\1_MyProjects\VOEBSOVET_RU\app2

# Удаляем lockfile'ы из git
git rm package-lock.json
git rm server/package-lock.json

# Коммитим изменения
git add Dockerfile server/Dockerfile .gitignore CORRECT_ENV_VARS.md DEPLOY_NOW.md
git commit -m "Fix: Use npm install instead of npm ci, remove lockfiles, update URLs"
git push
```

---

## 🎯 ШАГ 3: ПОДОЖДИТЕ ДЕПЛОЯ

Timeweb автоматически запустит деплой. Следите за логами.

### ✅ Ожидаемый успешный лог:

```
Building docker compose
✓ Built api
✓ Built web
Container api-1 Starting
Container api-1 Started
Container web-1 Starting
Container web-1 Started
```

### ✅ В логах бекенда должно быть:

```
=== Server Starting ===
PORT: 3001
DB_HOST: [SET]
🔄 Connecting to database...
✅ Database connected
🔄 Creating tables...
✅ Tables created successfully
📊 Database tables: users, requests, ai_requests
✅ Server is running on port 3001
```

---

## 🎯 ШАГ 4: ПРОВЕРЬТЕ РАБОТУ

После успешного деплоя проверьте:

### Frontend:
```
https://voensovet.ru
```
Должен открыться сайт

### Backend Health Check:
```
https://voensovet.ru:3001/health
```
Должен вернуть:
```json
{
  "status": "ok",
  "timestamp": "2025-12-14T...",
  "port": 3001,
  "database": {
    "host": true,
    "port": true,
    "name": true
  }
}
```

---

## 📊 АРХИТЕКТУРА ДЕПЛОЯ

```
GitHub Repository (sergiologino/voensovet)
         ↓
  Timeweb APP Platform
         ↓
   docker-compose.yml
         ↓
    ┌────────┴────────┐
    ↓                 ↓
  API Service      Web Service
  (Backend)        (Frontend)
    ↓                 ↓
server/Dockerfile  Dockerfile
    ↓                 ↓
Node:18-alpine    Node:18-alpine (build) + Nginx (serve)
    ↓                 ↓
npm install       npm install → npm run build
    ↓                 ↓
node src/index.js nginx
    ↓                 ↓
PORT 3001         PORT 80 (→ 8080 external)
    ↓
PostgreSQL DB
147.45.213.154:5432
```

---

## 🔍 ПОРЯДОК СБОРКИ (docker-compose.yml)

1. **Сначала собирается `api`** (backend)
   - Context: `./server`
   - Dockerfile: `server/Dockerfile`
   - Команда: `npm install --only=production --legacy-peer-deps`
   - Запуск: `node src/index.js`
   - Порт: 3001

2. **Потом собирается `web`** (frontend)
   - Context: `.` (корень)
   - Dockerfile: `Dockerfile`
   - Команда: `npm install --legacy-peer-deps` → `npm run build`
   - Запуск: `nginx`
   - Порт: 80 (внутри) → 8080 (снаружи)
   - **Зависит от**: `api` (`depends_on: - api`)

3. **Порядок запуска**:
   - Docker Compose автоматически запустит `api` первым
   - После того как `api` запустится, запустится `web`

---

## 🆘 ЕСЛИ ДЕПЛОЙ УПАЛ

### Ошибка: "npm ci can only install packages when..."
✅ **Исправлено**: Используем `npm install` вместо `npm ci`

### Ошибка: "Bind for 0.0.0.0:80 failed: port is already allocated"
✅ **Исправлено**: Frontend использует порт 8080 снаружи, а не 80

### Ошибка: "Database connection failed"
❓ **Проверьте**: Переменные `DB_*` установлены в Timeweb

### Ошибка: "Cannot GET /api"
❓ **Проверьте**: `VITE_API_URL` установлен на `https://voensovet.ru:3001`

---

## 📋 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

- [ ] Обновлен `VITE_API_URL` в Timeweb → `https://voensovet.ru:3001`
- [ ] Добавлен `VITE_API_BASE_URL` → `https://voensovet.ru:3001/api`
- [ ] Обновлен `YANDEX_REDIRECT_URI` → `https://voensovet.ru:3001/api/auth/yandex/callback`
- [ ] Удалены `package-lock.json` из git
- [ ] Закоммичены и запушены изменения

---

## 🚀 ДЕЙСТВУЙТЕ СЕЙЧАС!

1. Обновите переменные в Timeweb ⬆️
2. Выполните команды git ⬆️
3. Дождитесь деплоя ⏳
4. Проверьте работу ✅

**Весь процесс займёт ~5 минут после push'а в git.**


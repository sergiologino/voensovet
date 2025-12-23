# 🏗️ АРХИТЕКТУРА ПРИЛОЖЕНИЯ voensovet.ru

## 📊 Схема развертывания

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│                  github.com/sergiologino/voensovet               │
│                           Branch: new_version                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ git push
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Timeweb APP Platform                          │
│                    Auto-deploy on push                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ docker-compose up --build
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       docker-compose.yml                         │
│                                                                   │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │   Service: api      │         │   Service: web      │       │
│  │   (Backend)         │         │   (Frontend)        │       │
│  │                     │         │                     │       │
│  │  Context: ./server  │         │  Context: .         │       │
│  │  Port: 3001         │         │  Port: 80→8080      │       │
│  │  depends_on: none   │         │  depends_on: api    │       │
│  └──────────┬──────────┘         └──────────┬──────────┘       │
│             │                               │                   │
└─────────────┼───────────────────────────────┼───────────────────┘
              │                               │
              │ 1. Build first                │ 2. Build second
              ↓                               ↓
┌──────────────────────────┐    ┌──────────────────────────────┐
│  server/Dockerfile       │    │  Dockerfile (root)           │
│                          │    │                              │
│  FROM node:18-alpine     │    │  Stage 1: Builder            │
│                          │    │  FROM node:18-alpine         │
│  RUN apk add wget        │    │                              │
│  COPY package.json       │    │  COPY package.json           │
│  RUN npm install \       │    │  RUN npm install \           │
│      --only=production \ │    │      --legacy-peer-deps      │
│      --legacy-peer-deps  │    │  COPY src/                   │
│  COPY src/               │    │  RUN npm run build           │
│  CMD node src/index.js   │    │                              │
│                          │    │  Stage 2: Nginx              │
│  Expose: 3001            │    │  FROM nginx:alpine           │
│                          │    │  COPY dist/ → /usr/share/... │
│                          │    │  Expose: 80                  │
└──────────┬───────────────┘    └──────────┬───────────────────┘
           │                               │
           │ 3. Start first                │ 4. Start second
           ↓                               ↓
┌──────────────────────────┐    ┌──────────────────────────────┐
│  Container: api-1        │    │  Container: web-1            │
│                          │    │                              │
│  Node.js Express Server  │    │  Nginx Web Server            │
│  Port: 3001              │    │  Port: 80 (internal)         │
│                          │    │  Port: 8080 (external)       │
│  Endpoints:              │    │                              │
│  - /health               │    │  Serves: React SPA           │
│  - /api/auth/...         │    │  URL: https://voensovet.ru   │
│  - /api/users/...        │    │                              │
│  - /api/requests/...     │    │  API calls go to:            │
│  - /api/ai/...           │    │  https://voensovet.ru:3001   │
│                          │    │                              │
│  URL:                    │    │                              │
│  https://voensovet.ru:3001│   │                              │
└──────────┬───────────────┘    └──────────────────────────────┘
           │
           │ Database connection
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│                    Host: 147.45.213.154:5432                     │
│                    Database: voensovet_db                        │
│                                                                   │
│  Tables (auto-created on startup):                              │
│  - users                                                         │
│  - requests                                                      │
│  - ai_requests                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Порядок запуска

### 1️⃣ **API Service (Backend)** запускается первым
```
docker-compose.yml → service: api
    ↓
server/Dockerfile
    ↓
npm install --only=production --legacy-peer-deps
    ↓
node src/index.js
    ↓
Подключение к PostgreSQL (147.45.213.154:5432)
    ↓
Создание таблиц (users, requests, ai_requests)
    ↓
Запуск Express сервера на порту 3001
    ↓
Health check: http://localhost:3001/health
```

### 2️⃣ **Web Service (Frontend)** запускается вторым
```
docker-compose.yml → service: web (depends_on: api)
    ↓
Dockerfile (root)
    ↓
Stage 1: Builder
    npm install --legacy-peer-deps
    npm run build (Vite)
    ↓
    dist/ folder created
    ↓
Stage 2: Nginx
    COPY dist/ → /usr/share/nginx/html
    ↓
    nginx start
    ↓
Serve React SPA on port 80 (internal) → 8080 (external)
    ↓
Health check: http://localhost/health
```

---

## 🌐 URL Структура

### Пользовательские URL:

| Сервис | URL | Описание |
|--------|-----|----------|
| **Frontend** | https://voensovet.ru | Основной сайт (React SPA) |
| **Backend API** | https://voensovet.ru:3001 | API сервер (Express) |
| **Health Check** | https://voensovet.ru:3001/health | Проверка работы API |
| **Auth** | https://voensovet.ru:3001/api/auth/... | Авторизация |
| **Users** | https://voensovet.ru:3001/api/users/... | Пользователи |
| **Requests** | https://voensovet.ru:3001/api/requests/... | Обращения |
| **AI** | https://voensovet.ru:3001/api/ai/... | AI запросы |

### Внутренние URL (внутри Docker сети):

| Сервис | Internal URL | External URL |
|--------|--------------|--------------|
| **API** | http://api:3001 | https://voensovet.ru:3001 |
| **Web** | http://web:80 | https://voensovet.ru |

---

## 📦 Структура файлов

```
app2/
├── docker-compose.yml          # Оркестрация сервисов
├── Dockerfile                  # Frontend build
├── package.json                # Frontend dependencies
├── .gitignore                  # Git ignore (включая package-lock.json)
│
├── server/                     # Backend
│   ├── Dockerfile              # Backend build
│   ├── package.json            # Backend dependencies
│   └── src/
│       ├── index.js            # Entry point
│       ├── db/
│       │   └── init.js         # Database initialization
│       ├── routes/
│       │   └── index.js        # API routes
│       └── middleware/
│           └── auth.js         # Auth middleware
│
├── src/                        # Frontend source
│   ├── index.tsx               # React entry point
│   ├── App.tsx                 # Main React component
│   ├── pages/                  # React pages
│   ├── components/             # React components
│   ├── api/                    # API client
│   └── nginx.conf              # Nginx configuration
│
└── public/                     # Static assets
    ├── logo.jpg
    └── logo-placeholder.png
```

---

## 🔐 Переменные окружения

### Backend (Node.js)
Доступны через `process.env`:

```javascript
// server/src/index.js
const PORT = process.env.PORT || 3001;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
// ... и т.д.
```

### Frontend (Vite/React)
Доступны через `import.meta.env` (только с префиксом `VITE_`):

```typescript
// src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

**ВАЖНО**: Переменные фронтенда встраиваются в код во время сборки (`npm run build`), поэтому их нужно передавать как `ARG` в Dockerfile.

---

## 🔄 Процесс деплоя

```
1. Developer pushes to GitHub
   ↓
2. Timeweb detects push
   ↓
3. Timeweb clones repository
   ↓
4. Timeweb reads docker-compose.yml
   ↓
5. Timeweb builds API service (server/Dockerfile)
   ├─ npm install --only=production --legacy-peer-deps
   └─ COPY src/
   ↓
6. Timeweb builds Web service (Dockerfile)
   ├─ npm install --legacy-peer-deps
   ├─ npm run build (with VITE_* env vars)
   └─ COPY dist/ to nginx
   ↓
7. Timeweb starts API container (port 3001)
   ├─ Connect to PostgreSQL
   ├─ Create tables
   └─ Start Express server
   ↓
8. Timeweb starts Web container (port 8080)
   └─ Start Nginx
   ↓
9. Timeweb configures reverse proxy
   ├─ voensovet.ru → web:80
   └─ voensovet.ru:3001 → api:3001
   ↓
10. Deploy complete! ✅
```

---

## 🛠️ Технологический стек

### Frontend:
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.2.0
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.22.0
- **Icons**: Lucide React 0.522.0
- **PDF**: jsPDF 2.5.2, html2canvas 1.4.1
- **Language**: TypeScript 5.5.4
- **Server**: Nginx (Alpine)

### Backend:
- **Runtime**: Node.js 18 (Alpine)
- **Framework**: Express 4.18.2
- **Database Client**: pg 8.11.3
- **Language**: JavaScript (CommonJS)

### Database:
- **DBMS**: PostgreSQL
- **Host**: 147.45.213.154:5432
- **Database**: voensovet_db

### DevOps:
- **Containerization**: Docker, Docker Compose 3.8
- **CI/CD**: Timeweb APP Platform (auto-deploy)
- **Version Control**: Git, GitHub

---

## 📊 Порты

| Service | Internal Port | External Port | Public URL |
|---------|---------------|---------------|------------|
| **Frontend (Nginx)** | 80 | 8080 | https://voensovet.ru |
| **Backend (Express)** | 3001 | 3001 | https://voensovet.ru:3001 |
| **PostgreSQL** | 5432 | 5432 | 147.45.213.154:5432 |

---

## 🔍 Health Checks

### Backend Health Check:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

### Frontend Health Check:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🎯 Ключевые особенности

1. **Multi-stage build для фронтенда**
   - Stage 1: Build с Node.js (npm install + npm run build)
   - Stage 2: Serve с Nginx (легковесный production image)

2. **Автоматическая инициализация БД**
   - При старте бекенда автоматически создаются таблицы
   - Логирование всех этапов подключения и инициализации

3. **Health checks для обоих сервисов**
   - Docker Compose проверяет работоспособность контейнеров
   - Автоматический перезапуск при падении

4. **Зависимости между сервисами**
   - Frontend зависит от Backend (`depends_on: - api`)
   - Гарантирует правильный порядок запуска

5. **Переменные окружения через Timeweb**
   - Не хранятся в коде
   - Передаются через панель управления Timeweb

6. **Использование npm install вместо npm ci**
   - Решает проблему несинхронизированных lockfile'ов
   - Флаг `--legacy-peer-deps` для разрешения конфликтов

---

## 📚 Документация

- `DEPLOY_NOW.md` - Пошаговая инструкция по деплою
- `QUICK_DEPLOY.md` - Быстрый деплой (автоматический скрипт)
- `CORRECT_ENV_VARS.md` - Правильные переменные окружения
- `DATABASE_INITIALIZATION.md` - Настройка и инициализация БД
- `URL_CONFIGURATION.md` - Конфигурация URL и эндпоинтов
- `ARCHITECTURE.md` - Этот файл (архитектура системы)

---

## 🆘 Troubleshooting

### Проблема: Frontend не может подключиться к Backend
**Решение**: Проверьте `VITE_API_URL` в переменных Timeweb. Должно быть `https://voensovet.ru:3001`, а не `/server`.

### Проблема: Backend не подключается к БД
**Решение**: Проверьте переменные `DB_*` в Timeweb. Убедитесь, что PostgreSQL доступен с IP 147.45.213.154.

### Проблема: npm ci падает с ошибкой "lock file not in sync"
**Решение**: Используем `npm install` вместо `npm ci`. Lockfile'ы добавлены в `.gitignore`.

### Проблема: Порт 80 уже занят
**Решение**: Frontend использует порт 8080 снаружи (`8080:80` в docker-compose.yml).

---

**Версия документа**: 1.0  
**Дата**: 14 декабря 2025  
**Автор**: AI Assistant (Claude Sonnet 4.5)



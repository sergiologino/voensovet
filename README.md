# Voensovet.ru

Веб-портал для поддержки военнослужащих с интеграцией AI-ассистента "Комбат".

## 🚀 Быстрый деплой

### Автоматический (рекомендуется):
```powershell
.\deploy.ps1
```

### Ручной:
```bash
git rm package-lock.json server/package-lock.json
git add Dockerfile server/Dockerfile .gitignore
git commit -m "Fix: npm install, remove lockfiles"
git push
```

**Затем обновите переменные в Timeweb** (см. [QUICK_DEPLOY.md](./QUICK_DEPLOY.md))

---

## 📚 Документация

### 🎯 Для деплоя:
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Быстрый старт (начните отсюда!)
- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Пошаговая инструкция
- **[CORRECT_ENV_VARS.md](./CORRECT_ENV_VARS.md)** - Правильные переменные окружения

### 🏗️ Архитектура:
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Полная схема системы
- **[URL_CONFIGURATION.md](./URL_CONFIGURATION.md)** - Конфигурация URL
- **[DATABASE_INITIALIZATION.md](./DATABASE_INITIALIZATION.md)** - Настройка БД

### ⚙️ Настройка:
- **[TIMEWEB_ENV_SETUP.md](./TIMEWEB_ENV_SETUP.md)** - Переменные фронтенда
- **[SERVER_ENV_SETUP.md](./SERVER_ENV_SETUP.md)** - Переменные бекенда
- **[ENV_TEMPLATE.md](./ENV_TEMPLATE.md)** - Шаблон .env для локальной разработки

---

## 🛠️ Локальная разработка

### Требования:
- Node.js 18+
- PostgreSQL 12+
- npm или yarn

### Установка:

1. **Клонируйте репозиторий**:
```bash
git clone https://github.com/sergiologino/voensovet.git
cd voensovet
```

2. **Установите зависимости**:
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

3. **Настройте переменные окружения**:
```bash
# Создайте .env в корне (для фронтенда)
cp ENV_TEMPLATE.md .env

# Создайте .env в server/ (для бекенда)
cp server/.env.example server/.env
```

4. **Запустите БД** (если локально):
```bash
# Создайте БД в PostgreSQL
createdb voensovet_db
```

5. **Запустите сервисы**:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

6. **Откройте в браузере**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## 🌐 Production URLs

- **Frontend**: https://voensovet.ru
- **Backend API**: https://voensovet.ru:3001
- **Health Check**: https://voensovet.ru:3001/health

---

## 📦 Технологии

### Frontend:
- React 18.3.1
- TypeScript 5.5.4
- Vite 5.2.0
- Tailwind CSS 3.4.17
- React Router DOM 6.22.0
- jsPDF 2.5.2 (PDF export)

### Backend:
- Node.js 18
- Express 4.18.2
- PostgreSQL (pg 8.11.3)

### DevOps:
- Docker & Docker Compose
- Nginx (Alpine)
- Timeweb APP Platform

---

## 🔐 Переменные окружения

### Критические переменные для Timeweb:

```env
# Backend
DB_HOST=147.45.213.154
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=postgres_voensovet
DB_PASSWORD=postgres_voensovet
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://voensovet.ru

# Frontend (ВАЖНО!)
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Yandex OAuth
YANDEX_CLIENT_ID=your-client-id
YANDEX_CLIENT_SECRET=your-client-secret
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback

# AI Service
AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
AI_SERVICE_API_KEY=your-api-key
```

Полный список см. в [CORRECT_ENV_VARS.md](./CORRECT_ENV_VARS.md)

---

## 🎯 Основные функции

- ✅ Авторизация через Yandex OAuth
- ✅ AI-ассистент "Комбат" для консультаций
- ✅ База знаний по правам военнослужащих
- ✅ Региональные организации поддержки
- ✅ Экспорт консультаций в PDF (с поддержкой кириллицы)
- ✅ История обращений и AI-запросов
- ✅ Адаптивный дизайн (mobile-first)

---

## 📊 Структура проекта

```
app2/
├── docker-compose.yml       # Оркестрация сервисов
├── Dockerfile               # Frontend build
├── package.json             # Frontend dependencies
├── deploy.ps1               # Скрипт автодеплоя
│
├── server/                  # Backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js         # Entry point
│       ├── db/init.js       # DB initialization
│       ├── routes/
│       └── middleware/
│
├── src/                     # Frontend source
│   ├── index.tsx
│   ├── App.tsx
│   ├── pages/
│   ├── components/
│   ├── api/
│   └── utils/
│
└── public/                  # Static assets
```

---

## 🆘 Troubleshooting

### Проблема: npm ci падает
**Решение**: Используем `npm install` вместо `npm ci`. Lockfile'ы в `.gitignore`.

### Проблема: Frontend не видит Backend
**Решение**: Проверьте `VITE_API_URL=https://voensovet.ru:3001` в Timeweb.

### Проблема: БД не инициализируется
**Решение**: Проверьте переменные `DB_*` и логи бекенда.

Подробнее см. [ARCHITECTURE.md](./ARCHITECTURE.md) → Troubleshooting

---

## 📝 Лицензия

Proprietary - Все права защищены

---

## 👥 Контакты

- **GitHub**: https://github.com/sergiologino/voensovet
- **Website**: https://voensovet.ru

---

**Версия**: 2.0  
**Последнее обновление**: 14 декабря 2025

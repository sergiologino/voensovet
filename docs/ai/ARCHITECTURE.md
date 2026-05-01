# ARCHITECTURE

## Компоненты

### Frontend (корень репозитория)

- **Сборка:** Vite 5, React 18, TypeScript (строгий режим в `tsconfig.json`).
- **Стили:** Tailwind CSS 3, PostCSS, `src/index.css`, дизайн-токены в `src/styles/design-tokens.css`.
- **Раздача в продакшене:** многостадийный **Dockerfile** в корне — сборка Node 18 Alpine → статика в **nginx:alpine**; конфиг nginx копируется из **`src/nginx.conf`** в контейнер.
- **Маршрутизация в приложении:** клиентская навигация через **hash** (`window.location.hash`), без использования API `react-router-dom` в коде под `src/` (зависимость при этом указана в `package.json`).
- **Входная точка:** `src/index.tsx` рендерит `<App />`; в `App.tsx` обёртки `AuthProvider`, `RegionProvider`, компонент `PageTracker`.

### Backend (`server/`)

- **Стек:** Express 4, ES-модули (`"type": "module"`), точка входа `server/src/index.js`.
- **Порт:** `process.env.PORT` или **3001** по умолчанию в коде; в **`docker-compose.yml`** для сервиса `api` задано **`PORT=3002`**.
- **Обязательная переменная окружения при старте:** `JWT_SECRET` (иначе процесс завершается с кодом 1).
- **Маршруты API (префиксы):**
  - `/api/auth` → `routes/auth.js`
  - `/api/user` → `routes/user.js`
  - `/api/admin` → `routes/admin.js`
  - `/api/ai` → `routes/ai.js`
- **Health:** `GET /health` возвращает JSON со статусом и временной меткой.
- **Данные:** PostgreSQL через пакет `pg`, пул в `server/src/db/init.js`; при старте выполняется инициализация/создание таблиц и лёгкие миграции через SQL в том же модуле.

### Инфраструктура (Docker Compose)

Файл **`docker-compose.yml`** описывает три сервиса:

| Сервис    | Назначение |
|-----------|------------|
| `postgres` | PostgreSQL 16 Alpine, том `voensovet_postgres_data`, публикация **15432→5432**, healthcheck `pg_isready`. |
| `api`      | Сборка из `./server`, переменные БД, JWT, Yandex OAuth, AI-сервис, `FRONTEND_URL`; healthcheck на `http://localhost:3002/health`. |
| `web`      | Сборка корневого Dockerfile; build-args `VITE_API_URL`, `VITE_API_BASE_URL`; `depends_on: api`. |

Прокси: в **`src/nginx.conf`** запросы **`/api/`** передаются на **`http://api:3002`**.

### Внешние интеграции (по конфигурации и коду)

- **Yandex OAuth:** переменные `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_REDIRECT_URI` в compose для `api`.
- **Внешний AI-сервис:** `AI_SERVICE_URL`, `AI_SERVICE_API_KEY` в compose для `api`.
- **Аналитика:** счётчик Yandex.Metrika в **`index.html`**.

## CI / образы

- Workflow **GitHub Actions** присутствует как **`src/.github/workflows/deploy.yml`** (сборка и публикация Docker-образа в GHCR, уведомление деплоя). В **корне репозитория каталога `.github/` нет** — стандартное расположение workflows для GitHub — корень `.github/workflows/`.

## Связь frontend ↔ API

- Клиент **`src/api/client.ts`** использует `import.meta.env.VITE_API_URL` или пустую строку; запросы идут на пути вида `/api/...` с `credentials: 'include'` и заголовком `Authorization` при наличии `token` в `localStorage`.

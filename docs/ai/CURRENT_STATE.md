# CURRENT_STATE

*Актуализировать при любых значимых изменениях кода или инфраструктуры.*

## Структура репозитория

- **Frontend:** корень (`package.json`, `vite.config.ts`, `src/`).
- **Backend:** `server/` (отдельный `package.json`, `server/Dockerfile`, `server/src/`).
- **Docker:** корневой `Dockerfile` (nginx + собранный SPA), `docker-compose.yml` (postgres + api + web).
- **Скрипты деплоя:** в корне есть `deploy.ps1` и множество markdown-инструкций (не входят в AI-память по содержанию, только факт наличия).

## Сборка и скрипты

### Корень (frontend)

- `npm run dev` — `npx vite`
- `npm run build` — **`vitest run`** затем **`npx vite build`**
- `npm run test` — **`vitest run`**
- `npm run lint` — ESLint по `.js,.jsx,.ts,.tsx`
- `npm run preview` — `npx vite preview`

### Backend (`server/`)

- `npm run dev` — `node --watch src/index.js`
- `npm run start` — `node src/index.js`

## Тесты

- **Vitest** подключён; один файл **`src/constants/routeSeo.test.ts`** проверяет полноту **`SEO_BY_PAGE`** для всех ключей страниц из **`App.tsx`**.

## SEO и статика

- **`public/robots.txt`** — правило для основных краулеров и части ботов ИИ; `Disallow: /api/`; ссылка на sitemap **https://voensovet.ru/sitemap.xml**.
- **`public/sitemap.xml`** — основные hash-URL разделов (без личного кабинета, админки и OAuth callback).
- **`index.html`**: язык **`ru`**, базовые `meta description`, `keywords`, canonical **`https://voensovet.ru/`**, Open Graph и Twitter Card (fallback без выполнения JS).
- **Клиент:** **`src/constants/site.ts`** — `SITE_ORIGIN` из **`VITE_SITE_URL`** или **`https://voensovet.ru`**.
- **`src/constants/routeSeo.ts`** — `title`, `description`, `keywords`, `hash`, `noindex` для каждого ключа **`currentPage`**.
- **`AppRouteSEO`** в **`App.tsx`** синхронизирует мета-теги с активным маршрутом; **`SEO.tsx`** дополняет OG/Twitter, **`rel="canonical"`**, **`hreflang="ru"`**, JSON-LD (**Organization**, **WebSite**, **WebPage**).
- **Яндекс.Метрика:** счётчик уже подключён в **`index.html`** (то же состояние после правок).

## Реализованные возможности (по наличию страниц и API-клиента)

- Страницы SPA (hash-маршруты в `App.tsx`): приветственный вход, домашняя, помощь, контрактная служба, разделы veteran/family/bereaved/benefits/complaints/organizations/return, профиль, админка, OAuth callback.
- UI-компоненты: шапка/подвал, регион, AI-ассистент с Markdown, формы входа/регистрации, карточки организаций и др.
- Клиентский модуль `api` покрывает auth, профиль, заявки/визиты страниц, админ-настройки и статистику, историю и обработку AI.

## Заголовки h1/h2

- В **`Header`** название сайта не является **`h1`** (основной **`h1`** — у контента страницы).
- На главной карточный блок героя: один **`h1`** («Здесь вам помогут и подскажут»), подразделы с **`h2`** / **`h2`** для блоков ниже по иерархии.
- На **`HelpPage`**: **`h1`** для темы экрана, добавлены содержательные **`h2`**.

## Замечания по коду (наблюдаемые)

- **`react-router-dom`** указан в зависимостях, но импортов из этого пакета в `src/` не обнаружено.

## Vite build

- В **`vite.config.ts`** имена выходных chunk/asset файлов включают **`Date.now()`** для смены хэша при каждой сборке.

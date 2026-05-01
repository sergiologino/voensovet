# CONVENTIONS

## Язык и стиль кода (frontend)

- **TypeScript:** проект с **`"strict": true`**, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` в `tsconfig.json`.
- **ESLint:** конфиг **`.eslintrc.cjs`** — `eslint:recommended`, `@typescript-eslint/recommended`, `react-hooks/recommended`, плагин `react-refresh` с правилом `only-export-components` (warn).
- **Импорты JSX:** `"jsx": "react-jsx"`.

## Окружение frontend (Vite)

- Публичные переменные сборки — с префиксом **`VITE_`** (см. **`src/utils/env.ts`** и использование **`import.meta.env`** в клиенте).
- Опционально **`VITE_SITE_URL`** — канонический origin без завершающего `/` для SEO (по умолчанию **`https://voensovet.ru`** в **`src/constants/site.ts`**).
- В Docker-сборке корня передаются **`VITE_API_URL`**, **`VITE_API_BASE_URL`** (ARG/ENV в `Dockerfile`).

## Backend

- **ES modules:** `"type": "module"` в `server/package.json`; расширения импортов `.js` в исходниках относительно собранных/исполняемых файлов.
- **CORS:** origin из **`FRONTEND_URL`** или дефолт `http://localhost:5173`.

## Инфраструктура

- Node **18** в обоих Dockerfile (корень и `server/`).
- Nginx-конфиг SPA лежит в **`src/nginx.conf`** и копируется в образ фронта.

## Markdown / память AI

- В **`docs/ai/`** не помещать логи, stack trace, черновые гипотезы — только устойчивые факты и решения.

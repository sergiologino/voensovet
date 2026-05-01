# DECISIONS

Формат записей: дата (UTC или текстово), статус **Active** | **Superseded**, краткое решение, контекст/причина по фактам репозитория.

---

## 2026-05-01 — AI project memory location — Active

- **Решение:** Вести постоянную память для работ ИИ только в **`docs/ai/`** (файлы `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `DECISIONS.md`, `CONVENTIONS.md`, `CHANGELOG_AI.md`; при росте — `docs/ai/domains/`).
- **Причина:** Явный контракт владельца проекта; история чата не является источником истины.

---

## 2026-05-01 — Architecture documentation duplication — Active

- **Решение:** Корневой **`ARCHITECTURE.md`** и прочие markdown в корне остаются как есть; **`docs/ai/ARCHITECTURE.md`** описывает архитектуру с опорой на текущий код и `docker-compose.yml`, без обязательной синхронизации со всеми старыми корневыми документами.
- **Причина:** Инициализация AI-памяти; корень уже содержит развёрнутую документацию деплоя, возможны расхождения формулировок с кодом.

---

## 2026-05-01 — SEO при hash-маршрутизации SPA — Active

- **Решение:** Канонический URL для каждого виртуального раздела задавать как **`{SITE_ORIGIN}/#{route}`** (например `https://voensovet.ru/#help`). Базовый домен по умолчанию **`https://voensovet.ru`**, переопределение через **`VITE_SITE_URL`**. Публичные **`robots.txt`** и **`sitemap.xml`** лежат в **`public/`** и попадают в **`dist/`** при сборке; личный кабинет, админка и OAuth callback помечены **`noindex`** в **`SEO_BY_PAGE`**.
- **Причина:** Приложение на клиентском hash без History API; единый `title`/meta задаются компонентом **`AppRouteSEO`** по ключу страницы из **`routeSeo.ts`**.

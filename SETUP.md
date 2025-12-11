# Инструкция по настройке приложения

## Общая структура

Приложение состоит из двух частей:
1. **Frontend** (React + Vite) - в корне проекта
2. **Backend** (Node.js + Express) - в папке `server/`

## Быстрый старт

### 1. Настройка Backend

```bash
cd server
npm install
# Установите переменные окружения на сервере (см. ENVIRONMENT_VARIABLES.md)
npm run dev
```

### 2. Настройка Frontend

```bash
# В корне проекта
npm install
# Установите переменную окружения VITE_API_URL (см. ENVIRONMENT_VARIABLES.md)
npm run dev
```

### 3. Настройка PostgreSQL

Создайте базу данных и пользователя:
```sql
CREATE DATABASE voensovet_db;
CREATE USER voensovet_user WITH PASSWORD 'voensovet_password';
GRANT ALL PRIVILEGES ON DATABASE voensovet_db TO voensovet_user;
```

Таблицы создадутся автоматически при первом запуске backend сервера.

### 4. Настройка OAuth Yandex

1. Перейдите на https://oauth.yandex.ru/
2. Создайте приложение
3. Укажите Redirect URI: `http://localhost:3001/api/auth/yandex/callback`
4. Скопируйте Client ID и Secret в `server/.env`

### 5. Настройка AI Service

1. Зарегистрируйтесь в AI сервисе
2. Создайте клиентское приложение
3. Получите API ключ
4. Укажите его в `server/.env` как `AI_SERVICE_API_KEY`

## Создание администратора

После первого запуска создайте пользователя и установите флаг `is_admin` в БД:

```sql
UPDATE users SET is_admin = TRUE WHERE phone = 'ваш_телефон';
```

## Логотип

Поместите файл `logo-placeholder.png` размером 150x150px в папку `public/`.
Если файл не найден, будет показана заглушка с текстом "ПП".

## Структура базы данных

- `users` - пользователи
- `user_sessions` - сессии пользователей
- `user_requests` - история посещений страниц
- `ai_requests` - история AI запросов
- `admin_settings` - настройки админа (промпты)

## Особенности

- Авторизация: логин+пароль или OAuth Yandex
- Простая капча (математическая задача)
- Трекинг посещений страниц для авторизованных пользователей
- Двухэтапная обработка AI запросов (первичный анализ + финальный ответ)
- Админка для управления промптами и просмотра статистики


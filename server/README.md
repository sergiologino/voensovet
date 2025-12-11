# Backend Server для Портал Поддержки

## Установка

1. Установите зависимости:
```bash
cd server
npm install
```

2. Установите переменные окружения на сервере (см. `ENVIRONMENT_VARIABLES.md` в корне проекта):
   Все необходимые переменные окружения описаны в файле `ENVIRONMENT_VARIABLES.md` в корне проекта.

## Настройка PostgreSQL

1. Создайте базу данных:
```sql
CREATE DATABASE voensovet_db;
CREATE USER voensovet_user WITH PASSWORD 'voensovet_password';
GRANT ALL PRIVILEGES ON DATABASE voensovet_db TO voensovet_user;
```

2. Таблицы создадутся автоматически при первом запуске сервера.

## Настройка OAuth Yandex

1. Перейдите на https://oauth.yandex.ru/
2. Создайте новое приложение
3. Укажите Redirect URI: `http://localhost:3001/api/auth/yandex/callback` (для разработки)
4. Скопируйте Client ID и Client Secret в `.env`

## Настройка AI Service

1. Зарегистрируйтесь в AI сервисе (https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net)
2. Создайте клиентское приложение через админку AI сервиса
3. Скопируйте API ключ в `AI_SERVICE_API_KEY` в `.env`

## Запуск

Для разработки:
```bash
npm run dev
```

Для продакшена:
```bash
npm start
```

Сервер запустится на порту, указанном в `PORT` (по умолчанию 3001).

## API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь
- `GET /api/auth/yandex` - OAuth Yandex начало
- `GET /api/auth/yandex/callback` - OAuth Yandex callback

### Пользователь
- `GET /api/user/profile` - Профиль
- `PUT /api/user/profile` - Обновить профиль
- `PUT /api/user/password` - Изменить пароль
- `GET /api/user/requests` - История запросов
- `POST /api/user/requests` - Добавить запись в историю

### Админка
- `GET /api/admin/settings` - Настройки AI промптов
- `PUT /api/admin/settings` - Обновить настройки
- `GET /api/admin/users/stats` - Статистика
- `GET /api/admin/users` - Список пользователей
- `GET /api/admin/ai-requests` - История AI запросов

### AI
- `GET /api/ai/networks` - Доступные нейросети
- `POST /api/ai/process` - Обработать запрос через AI
- `GET /api/ai/history` - История AI запросов пользователя


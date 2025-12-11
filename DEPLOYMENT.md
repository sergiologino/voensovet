# Инструкция по развертыванию

## Предварительные требования

1. Node.js 18+ 
2. PostgreSQL 12+
3. npm или yarn

## Шаг 1: Настройка базы данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных и пользователя
CREATE DATABASE voensovet_db;
CREATE USER voensovet_user WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE voensovet_db TO voensovet_user;
\q
```

## Шаг 2: Настройка Backend

```bash
cd server
npm install

# Установите переменные окружения на сервере
# См. полный список в ENVIRONMENT_VARIABLES.md в корне проекта
```

## Шаг 3: Настройка Frontend

```bash
# В корне проекта
npm install

# Установите переменную окружения VITE_API_URL
# См. ENVIRONMENT_VARIABLES.md для деталей
```

## Шаг 4: Запуск в режиме разработки

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

## Шаг 5: Создание первого администратора

1. Зарегистрируйтесь через форму регистрации или OAuth Yandex
2. Войдите в PostgreSQL и установите флаг администратора:

```sql
psql -U voensovet_user -d voensovet_db
UPDATE users SET is_admin = TRUE WHERE phone = 'ваш_телефон';
```

## Шаг 6: Настройка AI Service

1. Зарегистрируйтесь в AI сервисе: https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
2. Создайте клиентское приложение через админку
3. Скопируйте API ключ в `server/.env` как `AI_SERVICE_API_KEY`
4. В админке вашего приложения настройте промпты для AI

## Шаг 7: Добавление логотипа

Поместите файл `logo-placeholder.png` размером 150x150px в папку `public/`.

## Продакшен

### Backend
- Используйте PM2 или systemd для запуска сервера
- Настройте reverse proxy (nginx) для проксирования запросов
- Используйте HTTPS

### Frontend
- Соберите проект: `npm run build`
- Разместите файлы из `dist/` на веб-сервере (nginx, Apache)
- Настройте редирект всех запросов на `index.html` для SPA

## Проверка работы

1. Откройте фронтенд в браузере
2. Зарегистрируйтесь или войдите
3. Проверьте личный кабинет (#profile)
4. Если вы администратор, проверьте админку (#admin)
5. Проверьте работу AI интеграции (через админку настройте промпты)

## Устранение проблем

### База данных не подключается
- Проверьте настройки в `.env`
- Убедитесь что PostgreSQL запущен
- Проверьте права доступа пользователя

### OAuth Yandex не работает
- Проверьте Redirect URI в настройках приложения Yandex
- Убедитесь что URL совпадает с настройками в `.env`

### AI запросы не работают
- Проверьте `AI_SERVICE_API_KEY` в `.env`
- Убедитесь что клиентское приложение создано в AI сервисе
- Проверьте доступность AI сервиса


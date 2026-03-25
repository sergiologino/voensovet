# Чеклист перед деплоем на Timeweb

## Что было исправлено

### 1. ✅ Изменен порт фронтенда
- **Было**: `80:80` (конфликт с Timeweb прокси)
- **Стало**: `8080:80`
- **Файл**: `docker-compose.yml`

### 2. ✅ Восстановлен package.json сервера
- **Файл**: `server/package.json`
- **Содержит**: зависимость Express

### 3. ✅ Создана структура сервера
```
server/
├── Dockerfile          ✅
├── package.json        ✅
├── .dockerignore       ✅
└── src/
    ├── index.js        ✅ (Express сервер)
    ├── routes/         ✅
    ├── middleware/     ✅
    └── db/             ✅
```

## Перед деплоем

### Проверьте структуру проекта:

```bash
# В корне проекта должны быть:
Dockerfile              # Для фронтенда
docker-compose.yml      # Конфигурация обоих сервисов
package.json            # Зависимости фронтенда

# В папке server/ должны быть:
server/Dockerfile       # Для бэкенда
server/package.json     # Зависимости бэкенда
server/src/index.js     # Точка входа сервера
```

### Закоммитьте изменения:

```bash
git add docker-compose.yml
git add server/package.json
git add server/src/
git add server/Dockerfile
git add server/.dockerignore
git commit -m "Fix Timeweb deployment: change port and add server files"
git push
```

## Настройки в панели Timeweb

### Переменные окружения

#### Для фронтенда (с префиксом VITE_):
```
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Для бэкенда (без префикса VITE_):
```
NODE_ENV=production
PORT=3000
# Добавьте другие переменные при необходимости:
# DATABASE_URL=...
# JWT_SECRET=...
```

### Настройка портов

В настройках приложения укажите:
- **Порт приложения**: `8080` (или оставьте автоопределение)

## Ожидаемый результат

После успешного деплоя:

1. ✅ Контейнер `web` запустится на порту 8080
2. ✅ Контейнер `api` запустится на порту 3000
3. ✅ Фронтенд доступен по URL приложения
4. ✅ API доступен на `/health` (проверка: `curl http://localhost:3000/health`)

## Проверка работы

### 1. Проверьте логи в панели Timeweb

Должны увидеть:
```
Server is running on port 3000
Environment: production
```

### 2. Проверьте health endpoints

```bash
# Frontend health (если настроен)
curl http://your-app-url/health

# Backend health
curl http://your-app-url:3000/health
```

## Если проблемы продолжаются

### Вариант 1: Измените docker-compose.yml

Используйте `expose` вместо `ports`:

```yaml
services:
  web:
    expose:
      - "80"
```

### Вариант 2: Разделите приложения

Создайте **два отдельных приложения** на Timeweb:

1. **Frontend App**:
   - Git репозиторий: `https://github.com/sergiologino/voensovet.git`
   - Dockerfile: корневой `Dockerfile`
   - Порт: автоопределение

2. **Backend App**:
   - Git репозиторий: `https://github.com/sergiologino/voensovet.git`
   - Dockerfile: `server/Dockerfile`
   - Контекст сборки: `server/`
   - Порт: `3000`

Это более надежный вариант для production.



# 🔧 NGINX REVERSE PROXY ДЛЯ API

## 🎯 РЕШЕНИЕ ПРОБЛЕМЫ SSL

**Проблема**: `ERR_SSL_PROTOCOL_ERROR` при обращении к API через HTTPS на порту 3002.

**Причина**: Backend на порту 3002 работает только по HTTP, без SSL сертификата.

**Решение**: Nginx проксирует все `/api/*` запросы на backend внутри Docker сети.

---

## 📊 НОВАЯ АРХИТЕКТУРА

```
Browser (HTTPS)
      ↓
https://voensovet.ru/api/auth/register
      ↓
Timeweb Reverse Proxy (HTTPS → HTTP)
      ↓
Nginx Container (web:80)
      ↓
/api/* → proxy_pass http://api:3002
      ↓
Backend Container (api:3002)
      ↓
PostgreSQL
```

---

## ✅ ЧТО ИЗМЕНЕНО

### 1. **nginx.conf** - Добавлено проксирование

```nginx
location /api/ {
    proxy_pass http://api:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 2. **client.ts** - Используем относительные URL

```typescript
// Было:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Стало:
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
```

Теперь запросы идут на `/api/auth/register` вместо `https://voensovet.ru:3002/api/auth/register`.

### 3. **docker-compose.yml** - Добавлен depends_on

```yaml
web:
  depends_on:
    - api  # Nginx может обращаться к api по имени хоста
```

### 4. **Login.tsx & Register.tsx** - Yandex OAuth через прокси

```typescript
// Было:
window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/yandex`;

// Стало:
window.location.href = `/api/auth/yandex`;
```

---

## 🌐 МАРШРУТИЗАЦИЯ

### Frontend URL:
```
https://voensovet.ru/          → Nginx → index.html (React SPA)
https://voensovet.ru/health    → Nginx → "healthy"
```

### API URL (через прокси):
```
https://voensovet.ru/api/auth/register    → Nginx → http://api:3002/api/auth/register
https://voensovet.ru/api/auth/login       → Nginx → http://api:3002/api/auth/login
https://voensovet.ru/api/auth/yandex      → Nginx → http://api:3002/api/auth/yandex
https://voensovet.ru/api/user/profile     → Nginx → http://api:3002/api/user/profile
https://voensovet.ru/api/ai/process       → Nginx → http://api:3002/api/ai/process
```

---

## 🔐 ПРЕИМУЩЕСТВА

1. **✅ Нет Mixed Content** - все запросы через HTTPS
2. **✅ Один домен** - нет проблем с CORS
3. **✅ Безопасность** - backend не доступен напрямую извне
4. **✅ Простота** - не нужно настраивать SSL на backend
5. **✅ Производительность** - меньше latency (внутренняя сеть Docker)

---

## ⚙️ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ TIMEWEB

Теперь **НЕ НУЖНО** устанавливать `VITE_API_URL` и `VITE_API_BASE_URL` в Timeweb!

API автоматически будет доступен через:
- https://voensovet.ru/api/*

Оставьте только серверные переменные:
```env
PORT=3002
NODE_ENV=production
DB_HOST=147.45.213.154
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=postgres_voensovet
DB_PASSWORD=postgres_voensovet
JWT_SECRET=...
JWT_EXPIRES_IN=7d
YANDEX_CLIENT_ID=...
YANDEX_CLIENT_SECRET=...
YANDEX_REDIRECT_URI=https://voensovet.ru/api/auth/yandex/callback
AI_SERVICE_URL=...
AI_SERVICE_API_KEY=...
FRONTEND_URL=https://voensovet.ru
```

**ВАЖНО**: `YANDEX_REDIRECT_URI` теперь через прокси!

---

## 🧪 ЛОКАЛЬНАЯ РАЗРАБОТКА

Для локальной разработки создайте `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:3002
```

Это переопределит пустую строку и будет использовать прямой URL к backend.

---

## 🔍 ОТЛАДКА

### Проверить что Nginx проксирует правильно:

```bash
# Зайти в контейнер
docker exec -it <web-container-id> sh

# Проверить nginx конфигурацию
nginx -t

# Проверить логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Проверить DNS внутри Docker сети:

```bash
# Зайти в web контейнер
docker exec -it <web-container-id> sh

# Проверить что api доступен
wget -O- http://api:3002/api/auth/me
```

---

## 🆘 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### 1. Ошибка: "502 Bad Gateway"
**Причина**: Backend не запустился или недоступен.
**Решение**: Проверьте логи backend контейнера.

### 2. Ошибка: "Host not found"
**Причина**: Неправильное имя сервиса в docker-compose.
**Решение**: Убедитесь что имя сервиса `api` (не `backend`).

### 3. Yandex OAuth не работает
**Причина**: Неправильный redirect_uri.
**Решение**: В Yandex OAuth настройках укажите:
```
https://voensovet.ru/api/auth/yandex/callback
```

---

## ✅ ПОСЛЕ ДЕПЛОЯ

1. Откройте https://voensovet.ru
2. Нажмите "Войти"
3. Попробуйте зарегистрироваться
4. Ошибки **ERR_SSL_PROTOCOL_ERROR** больше не будет!
5. Все запросы идут через HTTPS

---

**Время деплоя**: ~3-5 минут ⏱️

**Результат**: Полностью рабочая авторизация через HTTPS! 🎉



# Конфигурация URL для voensovet.ru

## Текущие URL

### Frontend
- **Основной URL**: https://voensovet.ru
- **Альтернативный**: https://sergiologino-voensovet-1e9f.twc1.net

### Backend API
В зависимости от конфигурации Timeweb, API может быть доступен по одному из URL:

**Вариант 1: Отдельный порт**
- https://voensovet.ru:3001
- https://voensovet.ru:3001/health
- https://voensovet.ru:3001/api

**Вариант 2: Через прокси (если Timeweb настроил)**
- https://voensovet.ru/api
- https://voensovet.ru/api/health

**Вариант 3: Поддомен (если настроен)**
- https://api.voensovet.ru
- https://api.voensovet.ru/health

## Обновление переменных окружения в Timeweb

Обновите следующие переменные в панели Timeweb:

### Frontend переменные (с префиксом VITE_)
```env
# Вариант 1: Если API на отдельном порту
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api

# Вариант 2: Если API через прокси
VITE_API_URL=https://voensovet.ru/api
VITE_API_BASE_URL=https://voensovet.ru/api

# Вариант 3: Если API на поддомене
VITE_API_URL=https://api.voensovet.ru
VITE_API_BASE_URL=https://api.voensovet.ru/api
```

### Backend переменные
```env
# Обновите эти URL
FRONTEND_URL=https://voensovet.ru
YANDEX_REDIRECT_URI=https://voensovet.ru/api/auth/yandex/callback

# Или если API на поддомене:
YANDEX_REDIRECT_URI=https://api.voensovet.ru/auth/yandex/callback
```

## Проверка текущей конфигурации

### 1. Проверьте доступность API

Попробуйте все варианты:
```bash
# Вариант 1: Порт 3001
curl https://voensovet.ru:3001/health

# Вариант 2: Через /api
curl https://voensovet.ru/api/health

# Вариант 3: Поддомен
curl https://api.voensovet.ru/health
```

### 2. Проверьте frontend
```bash
curl https://voensovet.ru
```

## Настройка nginx (если нужно)

Если Timeweb позволяет настроить nginx, добавьте проксирование:

```nginx
server {
    listen 80;
    server_name voensovet.ru;
    
    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://voensovet.ru' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
}
```

## CORS настройка

Добавьте CORS middleware в `server/src/index.js`:

```javascript
// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://voensovet.ru',
    'https://sergiologino-voensovet-1e9f.twc1.net',
    'http://localhost:5173' // для разработки
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

## После изменения переменных

1. **Пересобрать фронтенд** (так как VITE_ переменные встраиваются в код при сборке):
   ```bash
   git add .
   git commit -m "Update URLs to voensovet.ru"
   git push
   ```

2. **Перезапустить бэкенд** (переменные окружения обновятся автоматически)

3. **Проверить работу**:
   - Откройте https://voensovet.ru
   - Проверьте работу API через браузер dev tools (Network tab)
   - Убедитесь, что запросы идут на правильный URL

## Yandex OAuth

Обновите настройки в Yandex OAuth Console:
- **Callback URL**: измените на `https://voensovet.ru/api/auth/yandex/callback`
- Или на соответствующий URL в зависимости от вашей конфигурации

## Текущий статус

После деплоя проверьте в логах Timeweb:
```
✅ API URL: http://voensovet.ru:3001 or http://voensovet.ru/api
```

Это покажет, какой URL используется для API.



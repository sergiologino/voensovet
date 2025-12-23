# 🚨 СРОЧНО! ИСПРАВЛЕНИЕ ERR_SSL_PROTOCOL_ERROR

## ❌ ПРОБЛЕМА

Запросы идут на `https://voensovet.ru:3002/api/auth/register` и падают с ошибкой `ERR_SSL_PROTOCOL_ERROR`.

## 🔍 ПРИЧИНА

В настройках Timeweb установлены переменные `VITE_API_URL` и/или `VITE_API_BASE_URL`, которые **встраиваются в JavaScript код при сборке**.

Vite заменяет `import.meta.env.VITE_API_URL` на значение переменной **во время сборки**, поэтому даже если мы настроили Nginx прокси, код всё равно использует старое значение.

---

## ✅ РЕШЕНИЕ (НЕМЕДЛЕННО!)

### ШАГ 1: Зайдите в Timeweb

https://timeweb.cloud/my/app-platform

### ШАГ 2: Откройте "Переменные окружения"

### ШАГ 3: УДАЛИТЕ или ОЧИСТИТЕ эти переменные:

```
VITE_API_URL          ← УДАЛИТЬ ПОЛНОСТЬЮ!
VITE_API_BASE_URL     ← УДАЛИТЬ ПОЛНОСТЬЮ!
```

Если переменные нельзя удалить, установите **пустые значения**:
```
VITE_API_URL=
VITE_API_BASE_URL=
```

### ШАГ 4: СОХРАНИТЕ изменения

Timeweb автоматически запустит пересборку с правильными переменными.

---

## 📋 ПРАВИЛЬНЫЕ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

В Timeweb должны быть **ТОЛЬКО** эти переменные для backend:

```env
# Backend
PORT=3002
NODE_ENV=production

# Database
DB_HOST=147.45.213.154
DB_PORT=5432
DB_NAME=voensovet_db
DB_USER=postgres_voensovet
DB_PASSWORD=postgres_voensovet

# JWT
JWT_SECRET=35bh63vh6hj6hj6ljh46gh45g6l4g6kl45g6l
JWT_EXPIRES_IN=7d

# Yandex OAuth (ВАЖНО: без :3002!)
YANDEX_CLIENT_ID=your-yandex-client-id
YANDEX_CLIENT_SECRET=your-yandex-client-secret
YANDEX_REDIRECT_URI=https://voensovet.ru/api/auth/yandex/callback

# AI Service
AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
AI_SERVICE_API_KEY=5DDE26C2196CB9FA56A4DF5B466C7E2D2C1FA62BA10BDA1B

# Frontend URL
FRONTEND_URL=https://voensovet.ru
```

**ВАЖНО**: НЕ должно быть `VITE_API_URL` и `VITE_API_BASE_URL`!

---

## 🎯 КАК ЭТО РАБОТАЕТ

### ❌ До исправления:

```
Browser
  ↓
JavaScript код: const API_BASE_URL = 'https://voensovet.ru:3002';
  ↓
fetch('https://voensovet.ru:3002/api/auth/register')
  ↓
ERR_SSL_PROTOCOL_ERROR (нет SSL на порту 3002)
```

### ✅ После исправления:

```
Browser
  ↓
JavaScript код: const API_BASE_URL = '';
  ↓
fetch('/api/auth/register')
  ↓
Nginx: location /api/ { proxy_pass http://api:3002; }
  ↓
Backend Container (HTTP)
  ↓
SUCCESS! ✅
```

---

## 🔍 ПРОВЕРКА

После пересборки откройте консоль браузера (F12) и найдите:

```
🔍 API Configuration:
  VITE_API_URL: undefined
  API_BASE_URL: 
  Mode: production
```

Должно быть:
- ✅ `VITE_API_URL: undefined` или пустая строка
- ✅ `API_BASE_URL:` (пустая строка)

Если видите:
- ❌ `VITE_API_URL: "https://voensovet.ru:3002"`
- ❌ Ошибку: "API_BASE_URL содержит :3002!"

Значит переменные всё ещё установлены в Timeweb!

---

## ⏱️ ВРЕМЯ ИСПРАВЛЕНИЯ

1. Удаление переменных: **30 секунд**
2. Автоматическая пересборка: **3-5 минут**
3. Проверка работы: **30 секунд**

**ИТОГО: ~5 минут** ⏱️

---

## 🆘 ЕСЛИ НЕ ПОМОГЛО

### 1. Очистите кеш браузера:
```
Ctrl + Shift + Del → Очистить кэш и файлы cookie
```

### 2. Hard Reload:
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 3. Проверьте логи Timeweb:
Убедитесь, что деплой завершился успешно.

### 4. Проверьте Network в DevTools:
```
F12 → Network → попробуйте зарегистрироваться
```

Смотрите на какой URL идёт запрос:
- ✅ `/api/auth/register` (относительный) - ПРАВИЛЬНО
- ❌ `https://voensovet.ru:3002/api/auth/register` - НЕПРАВИЛЬНО

---

## 📞 КОНТРОЛЬНЫЙ СПИСОК

- [ ] Удалены `VITE_API_URL` и `VITE_API_BASE_URL` из Timeweb
- [ ] Сохранены изменения в Timeweb
- [ ] Дождались пересборки (~3-5 мин)
- [ ] Очищен кеш браузера (Ctrl+Shift+Del)
- [ ] Hard Reload (Ctrl+Shift+R)
- [ ] Проверена консоль: `API_BASE_URL` должен быть пустым
- [ ] Попробована регистрация заново

---

## 🎉 РЕЗУЛЬТАТ

После исправления:
- ✅ Регистрация работает
- ✅ Вход работает
- ✅ Yandex OAuth работает
- ✅ Нет ошибок SSL
- ✅ Все запросы через HTTPS

**ДЕЙСТВУЙТЕ СЕЙЧАС!** ⬆️



# 🔍 ОТЛАДКА 502 BAD GATEWAY

## 🐛 ПРОБЛЕМА

```
502 Bad Gateway
Failed to load resource: the server responded with a status of 502
```

**502 Bad Gateway** означает, что Nginx не может подключиться к backend контейнеру.

---

## 🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ

### 1. Backend не запустился
- Ошибка в коде (синтаксис)
- Ошибка при инициализации БД
- Отсутствуют переменные окружения
- Порт занят

### 2. Backend упал при старте
- Ошибка в миграциях БД
- Не удалось подключиться к PostgreSQL
- Ошибка в зависимостях

### 3. Неправильная конфигурация Docker
- Неправильное имя сервиса в `proxy_pass`
- Неправильный порт
- Backend не в той же Docker сети

---

## ✅ ЧТО СДЕЛАНО ДЛЯ ОТЛАДКИ

### 1. Добавлено подробное логирование

#### В `server/src/db/init.js`:
```javascript
console.log('📋 Creating tables...');
console.log('✅ Users table created/checked');
console.log('🔄 Running migrations for users table...');
console.log('✅ Users table migrations completed');
console.log('🔄 Adding CHECK constraint...');
console.log('✅ CHECK constraint added');
console.log('📋 Creating user_sessions table...');
// ... и так далее для каждого шага
```

#### В `server/src/routes/auth.js`:
```javascript
console.log('📝 Registration request received');
console.log('📧 Email registration:', emailValue);
console.log('📱 Phone registration:', phoneValue);
console.log('🔐 Hashing password...');
console.log('💾 Creating user in database...');
console.log('✅ User created successfully');
console.log('🔑 Creating JWT token...');
console.log('💾 Saving session to database...');
console.log('✅ Registration completed successfully');
```

### 2. Улучшена обработка ошибок

```javascript
catch (error) {
  console.error('❌ Registration error:', error);
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    detail: error.detail,
    stack: error.stack
  });
  next(error);
}
```

---

## 🔍 КАК ПРОВЕРИТЬ ЛОГИ В TIMEWEB

### Шаг 1: Откройте Timeweb App Platform
https://timeweb.cloud/my/app-platform

### Шаг 2: Выберите ваше приложение (voensovet)

### Шаг 3: Откройте вкладку "Логи" или "Logs"

### Шаг 4: Выберите контейнер `api` (backend)

### Шаг 5: Смотрите логи в реальном времени

---

## 📊 ЧТО ИСКАТЬ В ЛОГАХ

### ✅ Хорошие признаки (backend работает):

```
=== Server Starting ===
PORT: 3002
NODE_ENV: production
DB_HOST: [SET]
DB_PORT: [SET]
...
✅ Database connected
📋 Creating tables...
✅ Users table created/checked
🔄 Running migrations for users table...
✅ Users table migrations completed
🔄 Adding CHECK constraint...
✅ CHECK constraint added
📋 Creating user_sessions table...
✅ user_sessions table created
...
🎉 All tables and migrations completed successfully!
✅ Database tables initialized
✅ Server is running on port 3002
```

### ❌ Плохие признаки (backend упал):

```
❌ Database initialization error: ...
❌ Error: connect ECONNREFUSED ...
❌ SyntaxError: Unexpected token ...
❌ Error: Missing required environment variable ...
❌ Error: listen EADDRINUSE: address already in use :::3002
```

---

## 🆘 ЧАСТЫЕ ОШИБКИ И РЕШЕНИЯ

### 1. `SyntaxError: Unexpected token`
**Причина**: Синтаксическая ошибка в коде  
**Решение**: Проверьте последний коммит, исправьте синтаксис

### 2. `connect ECONNREFUSED` или `ENOTFOUND`
**Причина**: Не удалось подключиться к PostgreSQL  
**Решение**: Проверьте переменные `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### 3. `Missing required environment variable: JWT_SECRET`
**Причина**: Не установлена переменная `JWT_SECRET`  
**Решение**: Добавьте `JWT_SECRET` в переменные окружения Timeweb

### 4. `listen EADDRINUSE: address already in use :::3002`
**Причина**: Порт 3002 уже занят  
**Решение**: Измените порт в `docker-compose.yml` или остановите старый контейнер

### 5. `column "provider" does not exist`
**Причина**: Миграция не выполнилась  
**Решение**: Пересоздайте таблицу или выполните миграцию вручную

### 6. `null value in column "email" violates not-null constraint`
**Причина**: NOT NULL ограничение не удалено  
**Решение**: Миграция должна удалить NOT NULL (уже добавлена в код)

---

## 🧪 ТЕСТИРОВАНИЕ ПОСЛЕ ДЕПЛОЯ

### 1. Проверьте health check:
```
https://voensovet.ru/health
```

Должен вернуть:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T..."
}
```

Если **502** - backend не работает!

### 2. Проверьте логи backend:
Смотрите логи контейнера `api` в Timeweb.

### 3. Попробуйте зарегистрироваться:
```
https://voensovet.ru → Войти → Регистрация
```

Откройте DevTools (F12) → Network → попробуйте зарегистрироваться.

Смотрите на статус:
- **502** - backend не работает
- **500** - backend работает, но ошибка в коде
- **400** - backend работает, ошибка валидации
- **200** - ✅ Всё работает!

---

## 🔧 ВРЕМЕННОЕ РЕШЕНИЕ (ЕСЛИ BACKEND НЕ ЗАПУСКАЕТСЯ)

### Откатитесь на предыдущий коммит:

```bash
git log --oneline -10  # Смотрим последние коммиты
git reset --hard <commit-hash>  # Откатываемся на рабочий коммит
git push --force
```

**⚠️ ВНИМАНИЕ**: `--force` перезапишет историю!

---

## 📋 CHECKLIST ОТЛАДКИ

- [ ] Деплой завершён (~3-4 минуты)
- [ ] Открыты логи контейнера `api` в Timeweb
- [ ] В логах: "✅ Database connected"
- [ ] В логах: "✅ Database tables initialized"
- [ ] В логах: "✅ Server is running on port 3002"
- [ ] Health check работает: `https://voensovet.ru/health`
- [ ] Попробована регистрация
- [ ] Если 502 - смотрим логи backend
- [ ] Если 500 - смотрим детали ошибки в логах
- [ ] Если 400 - смотрим текст ошибки в DevTools
- [ ] Если 200 - ✅ Всё работает!

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Дождитесь деплоя** (~3-4 минуты)
2. **Откройте логи** контейнера `api` в Timeweb
3. **Найдите ошибку** (если backend упал)
4. **Сообщите мне** текст ошибки из логов
5. **Я исправлю** проблему

---

**ВАЖНО**: Логи - это ключ к решению! Без логов мы слепые. 🔍

**Откройте логи backend в Timeweb и пришлите мне первые 50-100 строк!** 📋



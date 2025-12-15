# 🔄 МИГРАЦИЯ БАЗЫ ДАННЫХ

## 🐛 ПРОБЛЕМА

При регистрации возникла ошибка:
```
column "provider" of relation "users" does not exist
```

## 🔍 ПРИЧИНА

Таблица `users` была создана ранее с неполной схемой (без колонок `provider`, `yandex_id`, `full_name`, `is_admin`, `updated_at`).

**Почему `CREATE TABLE IF NOT EXISTS` не помог?**

```sql
CREATE TABLE IF NOT EXISTS users (...);
```

Эта команда создаёт таблицу **только если её нет**. Если таблица уже существует, она НЕ обновляется и НЕ добавляет новые колонки.

---

## ✅ РЕШЕНИЕ

### 1. Автоматическая миграция (уже реализована)

В файле `server/src/db/init.js` добавлен код миграции:

```sql
DO $$ 
BEGIN
  -- Добавляем provider если не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'provider') THEN
    ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'local';
    RAISE NOTICE 'Column provider added to users table';
  END IF;
  
  -- Добавляем yandex_id если не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'yandex_id') THEN
    ALTER TABLE users ADD COLUMN yandex_id VARCHAR(255) UNIQUE;
    RAISE NOTICE 'Column yandex_id added to users table';
  END IF;
  
  -- ... и другие колонки
END $$;
```

### 2. Что произойдёт при следующем деплое?

1. **Сборка контейнеров** (~2 минуты)
2. **Запуск backend** контейнера
3. **Подключение к PostgreSQL**
4. **Выполнение миграций** - добавление недостающих колонок
5. **Backend готов** принимать запросы

---

## 📊 СТРУКТУРА ТАБЛИЦЫ `users` ПОСЛЕ МИГРАЦИИ

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) UNIQUE,          -- Телефон (для локального входа)
  email VARCHAR(255) UNIQUE,         -- Email (для локального входа)
  password_hash VARCHAR(255),        -- Хеш пароля (bcrypt)
  full_name VARCHAR(255),            -- Полное имя
  is_admin BOOLEAN DEFAULT FALSE,    -- Флаг администратора
  yandex_id VARCHAR(255) UNIQUE,     -- ID пользователя Яндекс (для OAuth)
  provider VARCHAR(50) DEFAULT 'local', -- Провайдер: 'local' или 'yandex'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Колонки по провайдеру:

**Локальная регистрация (`provider='local'`):**
- ✅ `phone` или `email` (обязательно)
- ✅ `password_hash` (обязательно)
- ✅ `full_name` (опционально)
- ❌ `yandex_id` (NULL)

**Регистрация через Яндекс (`provider='yandex'`):**
- ✅ `yandex_id` (обязательно)
- ✅ `full_name` (из Yandex API)
- ✅ `email` (из Yandex API)
- ❌ `phone` (может быть NULL)
- ❌ `password_hash` (NULL, т.к. нет пароля)

---

## 🔄 ЧТО ПРОИСХОДИТ ПРИ СТАРТЕ BACKEND

```
Backend Container Start
    ↓
initDatabase()
    ↓
pool.query('SELECT NOW()') → Проверка подключения
    ↓
createTables()
    ↓
CREATE TABLE IF NOT EXISTS users (...) → Создаст если нет
    ↓
DO $$ ... ADD COLUMN provider ... → Добавит недостающие колонки
    ↓
CREATE TABLE IF NOT EXISTS user_sessions (...)
    ↓
CREATE TABLE IF NOT EXISTS user_requests (...)
    ↓
CREATE TABLE IF NOT EXISTS ai_requests (...)
    ↓
CREATE TABLE IF NOT EXISTS admin_settings (...)
    ↓
CREATE INDEX IF NOT EXISTS ... → Индексы для производительности
    ↓
INSERT INTO admin_settings ... → Дефолтные промпты
    ↓
✅ Database tables initialized
    ↓
✅ Server is running on port 3002
```

---

## 🧪 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

### 1. Проверьте логи backend:

В Timeweb откройте логи контейнера `api`:

```
✅ Database connected
✅ Database tables initialized
✅ Server is running on port 3002
```

Если увидите:
```
RAISE NOTICE 'Column provider added to users table'
```

Значит миграция выполнилась!

### 2. Попробуйте зарегистрироваться:

```
https://voensovet.ru
```

1. Нажмите "Войти"
2. Переключитесь на "Регистрация"
3. Введите телефон или email
4. Введите пароль
5. Введите капчу (любое значение)
6. Нажмите "Зарегистрироваться"

**Должно работать!** ✅

### 3. Проверьте DevTools Console:

```
F12 → Console
```

**НЕ должно быть:**
- ❌ `column "provider" does not exist`
- ❌ `500 Internal Server Error`

**Должно быть:**
- ✅ Успешная регистрация
- ✅ Редирект на главную страницу
- ✅ Имя пользователя в header

---

## 🆘 ЕСЛИ ОШИБКА ПОВТОРИТСЯ

### Вариант 1: Пересоздать таблицу (ТОЛЬКО ДЛЯ РАЗРАБОТКИ!)

**⚠️ ВНИМАНИЕ**: Это удалит все данные!

```sql
-- Подключитесь к базе через psql или pgAdmin
DROP TABLE IF EXISTS ai_requests CASCADE;
DROP TABLE IF EXISTS user_requests CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- После удаления перезапустите backend
-- Он автоматически создаст все таблицы с правильной схемой
```

### Вариант 2: Ручная миграция через SQL

```sql
-- Подключитесь к базе
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### Вариант 3: Проверьте логи ошибок

```bash
# Смотрите логи backend
docker logs <api-container-id>

# Ищите ошибки PostgreSQL
```

---

## 📋 CHECKLIST ПОСЛЕ ДЕПЛОЯ

- [ ] Backend запустился без ошибок
- [ ] В логах: "Database tables initialized"
- [ ] Попробована регистрация - успешна
- [ ] Попробован вход - успешен
- [ ] OAuth через Яндекс работает
- [ ] Нет ошибок в DevTools Console
- [ ] Профиль пользователя отображается

---

## 🎉 РЕЗУЛЬТАТ

После успешной миграции:
- ✅ Таблица `users` содержит все необходимые колонки
- ✅ Регистрация по телефону работает
- ✅ Регистрация по email работает
- ✅ OAuth через Яндекс работает
- ✅ Пароли хешируются через bcrypt
- ✅ JWT токены создаются корректно

---

## ⏱️ ВРЕМЯ ДЕПЛОЯ

- **Сборка**: ~2-3 минуты
- **Миграция БД**: ~1-2 секунды
- **Запуск сервисов**: ~10-20 секунд
- **ИТОГО**: ~3-4 минуты ⏱️

**Дождитесь завершения деплоя и попробуйте зарегистрироваться!** 🚀


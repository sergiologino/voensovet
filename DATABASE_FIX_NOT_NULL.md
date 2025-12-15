# 🔧 ИСПРАВЛЕНИЕ NOT NULL ОГРАНИЧЕНИЙ

## 🐛 ПРОБЛЕМА

```
null value in column "email" of relation "users" violates not-null constraint
```

При регистрации через **телефон** возникает ошибка, потому что колонка `email` имеет ограничение `NOT NULL`, но пользователь регистрируется только с телефоном (без email).

---

## 🔍 ПРИЧИНА

Старая таблица `users` была создана с ограничениями:
- `phone VARCHAR(50) NOT NULL`
- `email VARCHAR(255) NOT NULL`

Но по логике приложения:
- ✅ Регистрация через **телефон** → `email` будет `NULL`
- ✅ Регистрация через **email** → `phone` будет `NULL`
- ✅ Регистрация через **Яндекс OAuth** → может быть только `yandex_id` и `email`

**Вывод**: `phone`, `email`, и `password_hash` должны быть **nullable**.

---

## ✅ РЕШЕНИЕ

### 1. Убрать NOT NULL ограничения

```sql
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

### 2. Добавить CHECK ограничение

Хотя бы **одно** из полей должно быть заполнено:

```sql
ALTER TABLE users ADD CONSTRAINT users_phone_or_email_required 
  CHECK (phone IS NOT NULL OR email IS NOT NULL OR yandex_id IS NOT NULL);
```

---

## 📊 ПРАВИЛЬНАЯ СХЕМА ТАБЛИЦЫ

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  
  -- Контактные данные (хотя бы одно обязательно)
  phone VARCHAR(50) UNIQUE,           -- Nullable! Может быть NULL
  email VARCHAR(255) UNIQUE,          -- Nullable! Может быть NULL
  yandex_id VARCHAR(255) UNIQUE,      -- Nullable! Только для OAuth
  
  -- Аутентификация
  password_hash VARCHAR(255),         -- Nullable! NULL для OAuth
  provider VARCHAR(50) DEFAULT 'local', -- 'local' или 'yandex'
  
  -- Профиль
  full_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ограничение: хотя бы одно из полей должно быть заполнено
  CONSTRAINT users_phone_or_email_required 
    CHECK (phone IS NOT NULL OR email IS NOT NULL OR yandex_id IS NOT NULL)
);
```

---

## 🎯 СЦЕНАРИИ РЕГИСТРАЦИИ

### 1️⃣ Регистрация через телефон

```sql
INSERT INTO users (phone, password_hash, full_name, provider)
VALUES ('+79991234567', 'bcrypt_hash', 'Иван Иванов', 'local');
```

✅ `phone` = `'+79991234567'`  
✅ `password_hash` = `'bcrypt_hash'`  
✅ `provider` = `'local'`  
❌ `email` = `NULL`  
❌ `yandex_id` = `NULL`  

### 2️⃣ Регистрация через email

```sql
INSERT INTO users (email, password_hash, full_name, provider)
VALUES ('user@example.com', 'bcrypt_hash', 'Иван Иванов', 'local');
```

✅ `email` = `'user@example.com'`  
✅ `password_hash` = `'bcrypt_hash'`  
✅ `provider` = `'local'`  
❌ `phone` = `NULL`  
❌ `yandex_id` = `NULL`  

### 3️⃣ Регистрация через Яндекс OAuth

```sql
INSERT INTO users (yandex_id, email, full_name, provider)
VALUES ('yandex_12345', 'user@yandex.ru', 'Иван Иванов', 'yandex');
```

✅ `yandex_id` = `'yandex_12345'`  
✅ `email` = `'user@yandex.ru'`  
✅ `provider` = `'yandex'`  
❌ `phone` = `NULL`  
❌ `password_hash` = `NULL` (нет пароля для OAuth)  

---

## 🔄 ЧТО ПРОИСХОДИТ ПРИ ДЕПЛОЕ

```
Backend Start
    ↓
initDatabase()
    ↓
CREATE TABLE IF NOT EXISTS users (...)
    ↓
DO $$ ... ALTER COLUMN phone DROP NOT NULL
    ↓
DO $$ ... ALTER COLUMN email DROP NOT NULL
    ↓
DO $$ ... ALTER COLUMN password_hash DROP NOT NULL
    ↓
ADD CONSTRAINT users_phone_or_email_required ...
    ↓
✅ Database tables initialized
    ↓
✅ Server ready to accept registrations
```

---

## 🧪 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

### 1. Проверьте логи backend:

```
✅ Database connected
NOTICE: NOT NULL constraint removed from phone column
NOTICE: NOT NULL constraint removed from email column
NOTICE: NOT NULL constraint removed from password_hash column
NOTICE: CHECK constraint added: at least one of phone, email, or yandex_id must be NOT NULL
✅ Database tables initialized
✅ Server is running on port 3002
```

### 2. Попробуйте зарегистрироваться через телефон:

```
https://voensovet.ru
```

1. Нажмите "Войти"
2. Переключитесь на "Регистрация"
3. Выберите "Телефон"
4. Введите: `+7 (999) 123-45-67`
5. Пароль: `Test1234!`
6. Капча: `12345`
7. Нажмите "Зарегистрироваться"

**Должно работать!** ✅

### 3. Попробуйте зарегистрироваться через email:

1. Выберите "Email"
2. Введите: `test@example.com`
3. Пароль: `Test1234!`
4. Капча: `12345`
5. Нажмите "Зарегистрироваться"

**Тоже должно работать!** ✅

### 4. Попробуйте Yandex OAuth:

1. Нажмите "Войти через Яндекс"
2. Авторизуйтесь на Яндексе
3. Разрешите доступ

**И это должно работать!** ✅

---

## 🆘 ЕСЛИ ОШИБКА ПОВТОРИТСЯ

### Вариант 1: Проверить схему таблицы

```sql
-- Подключитесь к базе через psql или pgAdmin
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Проверьте:
- ✅ `phone` → `is_nullable = YES`
- ✅ `email` → `is_nullable = YES`
- ✅ `password_hash` → `is_nullable = YES`

### Вариант 2: Проверить ограничения

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users';
```

Должно быть:
- ✅ `users_phone_or_email_required` (CHECK)

### Вариант 3: Ручная миграция

Если автоматическая миграция не сработала:

```sql
-- Убираем NOT NULL
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Добавляем CHECK
ALTER TABLE users ADD CONSTRAINT users_phone_or_email_required 
  CHECK (phone IS NOT NULL OR email IS NOT NULL OR yandex_id IS NOT NULL);
```

### Вариант 4: Пересоздать таблицу (ТОЛЬКО ДЛЯ РАЗРАБОТКИ!)

**⚠️ ВНИМАНИЕ**: Удалит все данные!

```sql
DROP TABLE IF EXISTS ai_requests CASCADE;
DROP TABLE IF EXISTS user_requests CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- После этого перезапустите backend
-- Таблицы создадутся с правильной схемой
```

---

## 📋 CHECKLIST

- [ ] Деплой завершён (~3-4 минуты)
- [ ] В логах: "NOT NULL constraint removed from phone column"
- [ ] В логах: "NOT NULL constraint removed from email column"
- [ ] В логах: "CHECK constraint added"
- [ ] Регистрация через телефон - работает ✅
- [ ] Регистрация через email - работает ✅
- [ ] Yandex OAuth - работает ✅
- [ ] Нет ошибок в DevTools Console

---

## 🎉 РЕЗУЛЬТАТ

После успешной миграции:
- ✅ `phone` и `email` могут быть `NULL`
- ✅ Регистрация через телефон работает
- ✅ Регистрация через email работает
- ✅ Регистрация через Яндекс работает
- ✅ CHECK ограничение гарантирует, что хотя бы одно поле заполнено
- ✅ Невозможно создать пользователя без контактных данных

---

## ⏱️ ВРЕМЯ ДЕПЛОЯ

- **Сборка**: ~2-3 минуты
- **Миграция БД**: ~1-2 секунды
- **Запуск сервисов**: ~10-20 секунд
- **ИТОГО**: ~3-4 минуты ⏱️

**ДОЖДИТЕСЬ ДЕПЛОЯ И ПОПРОБУЙТЕ ЗАРЕГИСТРИРОВАТЬСЯ!** 🚀


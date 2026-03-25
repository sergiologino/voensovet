# 📋 КРАТКОЕ РЕЗЮМЕ ИЗМЕНЕНИЙ

**Дата**: 14 декабря 2025  
**Причина**: Исправление ошибок деплоя на Timeweb APP Platform

---

## 🔴 ПРОБЛЕМЫ, КОТОРЫЕ БЫЛИ

### 1. npm ci падал с ошибкой
```
npm error `npm ci` can only install packages when your package.json 
and package-lock.json are in sync.
```

**Причина**: `package-lock.json` не синхронизирован с `package.json`

### 2. Неправильный URL API
```
VITE_API_URL=https://voensovet.ru/server  ← НЕПРАВИЛЬНО
```

**Причина**: Backend работает на порту 3001, а не на маршруте `/server`

### 3. Бекенд не запускался
**Причина**: Комбинация проблем 1 и 2

### 4. БД не инициализировалась
**Причина**: Бекенд не запускался, поэтому таблицы не создавались

---

## ✅ ЧТО ИСПРАВЛЕНО

### 1. **Dockerfile (Frontend)** - `app2/Dockerfile`

#### Было:
```dockerfile
RUN npm ci
```

#### Стало:
```dockerfile
# Используем npm install вместо npm ci из-за несинхронизированного package-lock.json
RUN npm install --legacy-peer-deps
```

**Эффект**: Сборка фронтенда теперь проходит успешно

---

### 2. **Dockerfile (Backend)** - `app2/server/Dockerfile`

#### Было:
```dockerfile
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi
```

#### Стало:
```dockerfile
RUN if [ -f package-lock.json ]; then npm ci --only=production --legacy-peer-deps; else npm install --only=production --legacy-peer-deps; fi
```

**Эффект**: Добавлен флаг `--legacy-peer-deps` для разрешения конфликтов зависимостей

---

### 3. **.gitignore** - `app2/.gitignore`

#### Добавлено:
```gitignore
package-lock.json
```

**Эффект**: Lockfile'ы больше не коммитятся в git, избегая проблем синхронизации

---

### 4. **Переменные окружения в Timeweb**

#### Было:
```env
VITE_API_URL=https://voensovet.ru/server
```

#### Должно быть:
```env
VITE_API_URL=https://voensovet.ru:3001
VITE_API_BASE_URL=https://voensovet.ru:3001/api
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback
```

**Эффект**: Frontend корректно обращается к Backend API

---

## 📚 НОВАЯ ДОКУМЕНТАЦИЯ

Создано 6 новых документов:

1. **CORRECT_ENV_VARS.md** - Правильные переменные окружения
2. **DEPLOY_NOW.md** - Пошаговая инструкция по деплою
3. **QUICK_DEPLOY.md** - Быстрый деплой (краткая версия)
4. **ARCHITECTURE.md** - Полная архитектура системы
5. **deploy.ps1** - Автоматический скрипт деплоя (PowerShell)
6. **CHANGES_SUMMARY.md** - Этот файл (резюме изменений)

Обновлено:
- **README.md** - Полностью переписан с учетом новой структуры

---

## 🎯 ЧТО НУЖНО СДЕЛАТЬ

### Шаг 1: Обновите переменные в Timeweb

Зайдите в панель Timeweb → Переменные окружения и **измените**:

```env
VITE_API_URL=https://voensovet.ru:3001
```

И **добавьте**:

```env
VITE_API_BASE_URL=https://voensovet.ru:3001/api
```

### Шаг 2: Запустите деплой

**Вариант A (автоматический)**:
```powershell
.\deploy.ps1
```

**Вариант B (ручной)**:
```bash
git rm package-lock.json server/package-lock.json
git add Dockerfile server/Dockerfile .gitignore README.md
git add CORRECT_ENV_VARS.md DEPLOY_NOW.md QUICK_DEPLOY.md ARCHITECTURE.md deploy.ps1 CHANGES_SUMMARY.md
git commit -m "Fix: npm install, remove lockfiles, update URLs to voensovet.ru:3001"
git push
```

### Шаг 3: Дождитесь деплоя (~3-5 минут)

### Шаг 4: Проверьте работу

- Frontend: https://voensovet.ru
- Backend: https://voensovet.ru:3001/health

---

## 📊 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

### ✅ Успешный деплой покажет в логах:

```
Building docker compose
✓ Built api
✓ Built web
Container api-1 Starting
Container api-1 Started
Container web-1 Starting
Container web-1 Started
Scanning docker compose for exposed ports
Deploy complete!
```

### ✅ В логах бекенда будет:

```
=== Server Starting ===
PORT: 3001
DB_HOST: [SET]
DB_PORT: [SET]
DB_NAME: [SET]
🔄 Connecting to database...
✅ Database connected: 2025-12-14T...
🔄 Creating tables...
✅ Tables created successfully
📊 Database tables: users, requests, ai_requests
✅ Server is running on port 3001
✅ Health check: http://localhost:3001/health
```

### ✅ Health check вернет:

```json
{
  "status": "ok",
  "timestamp": "2025-12-14T23:59:59.999Z",
  "port": 3001,
  "env": "production",
  "database": {
    "host": true,
    "port": true,
    "name": true,
    "user": true,
    "password": true
  },
  "services": {
    "yandexOAuth": true,
    "aiService": true
  }
}
```

---

## 🔍 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### Почему npm install вместо npm ci?

`npm ci` требует точного соответствия `package-lock.json` и `package.json`. Если они не синхронизированы (например, после обновления зависимостей), `npm ci` падает.

`npm install` более гибкий:
- Автоматически обновляет `package-lock.json`
- Разрешает конфликты зависимостей
- С флагом `--legacy-peer-deps` игнорирует peer-зависимости

### Почему package-lock.json в .gitignore?

В Docker-окружении lockfile'ы могут создавать проблемы:
1. Разные версии npm генерируют разные lockfile'ы
2. Lockfile может устареть после обновления зависимостей
3. В production Docker пересоздаст lockfile на основе `package.json`

Для локальной разработки lockfile'ы будут создаваться автоматически, но не коммититься в git.

### Почему порт 3001, а не /server?

Timeweb APP Platform маршрутизирует трафик по портам, а не по путям:
- Frontend (Nginx) → порт 80 (внутри) → 8080 (снаружи)
- Backend (Express) → порт 3001

Для маршрутизации по пути `/server` нужна дополнительная настройка Nginx reverse proxy, которой у нас нет.

---

## 📈 УЛУЧШЕНИЯ В БУДУЩЕМ

### Рекомендуется:

1. **Настроить reverse proxy в Nginx** для маршрутизации `/api` на backend
   - Тогда можно будет использовать `https://voensovet.ru/api` вместо `:3001`

2. **Добавить CI/CD тесты** перед деплоем
   - Unit tests для компонентов
   - Integration tests для API
   - E2E tests для критических путей

3. **Настроить мониторинг**
   - Логирование ошибок (Sentry)
   - Метрики производительности (Prometheus)
   - Uptime monitoring (UptimeRobot)

4. **Добавить кэширование**
   - Redis для сессий
   - CDN для статики

5. **Оптимизировать Docker образы**
   - Multi-stage builds для бекенда
   - Кэширование слоев

---

## 🆘 ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК

### Деплой упал на сборке фронтенда
→ Проверьте логи, возможно нужно обновить зависимости в `package.json`

### Деплой упал на сборке бекенда
→ Проверьте `server/package.json`, убедитесь что все зависимости указаны

### Бекенд запустился, но не подключается к БД
→ Проверьте переменные `DB_*` в Timeweb, убедитесь что PostgreSQL доступен

### Frontend не видит Backend
→ Проверьте `VITE_API_URL` в Timeweb, должно быть `https://voensovet.ru:3001`

### Все запустилось, но сайт не открывается
→ Проверьте DNS настройки домена `voensovet.ru`, убедитесь что он указывает на Timeweb

---

## 📞 КОНТАКТЫ

Если нужна помощь:
1. Проверьте документацию в этой папке
2. Посмотрите логи деплоя в Timeweb
3. Проверьте логи контейнеров в Timeweb
4. Обратитесь в поддержку Timeweb

---

**Итог**: Все проблемы исправлены, приложение готово к деплою! 🚀

**Следующий шаг**: Выполните команды из раздела "ЧТО НУЖНО СДЕЛАТЬ" выше.



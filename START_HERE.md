# 🚀 НАЧНИТЕ ОТСЮДА!

## ⚡ БЫСТРЫЙ СТАРТ (2 ШАГА)

### ✅ ШАГ 1: Обновите переменные в Timeweb

Зайдите в панель Timeweb → Настройки сервера → Переменные окружения

**Найдите эту переменную**:
```
VITE_API_URL
```

**Измените значение на**:
```
https://voensovet.ru:3001
```

**Добавьте новую переменную**:
```
Имя:  VITE_API_BASE_URL
Значение: https://voensovet.ru:3001/api
```

**Сохраните изменения** ✅

---

### ✅ ШАГ 2: Запустите деплой

Откройте PowerShell в этой папке и выполните:

```powershell
.\deploy.ps1
```

**ИЛИ** выполните вручную:

```bash
git rm package-lock.json server/package-lock.json
git add .
git commit -m "Fix: npm install, remove lockfiles, update URLs"
git push
```

---

## ⏱️ ОЖИДАЙТЕ 3-5 МИНУТ

Timeweb автоматически:
1. Скачает код из GitHub
2. Соберет Docker образы
3. Запустит контейнеры
4. Инициализирует БД

---

## ✅ ПРОВЕРЬТЕ РЕЗУЛЬТАТ

### Frontend:
```
https://voensovet.ru
```
Должен открыться сайт

### Backend:
```
https://voensovet.ru:3001/health
```
Должен вернуть JSON с `"status": "ok"`

---

## 🎉 ГОТОВО!

Если всё работает - поздравляю! 🎊

Если что-то не так - смотрите:
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Краткая инструкция
- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Подробная инструкция
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Что было исправлено

---

## 📊 СХЕМА (для понимания)

```
┌─────────────────────────────────────┐
│   GitHub (ваш код)                  │
└──────────────┬──────────────────────┘
               │ git push
               ↓
┌─────────────────────────────────────┐
│   Timeweb APP Platform              │
│   (автоматический деплой)           │
└──────────────┬──────────────────────┘
               │ docker-compose up
               ↓
┌──────────────────────┬──────────────────────┐
│   Backend (API)      │   Frontend (Web)     │
│   Port: 3001         │   Port: 80           │
│   Node.js + Express  │   React + Nginx      │
└──────────┬───────────┴──────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   147.45.213.154:5432               │
└─────────────────────────────────────┘
```

---

## 🔑 КЛЮЧЕВЫЕ URL

| Что | URL |
|-----|-----|
| **Сайт** | https://voensovet.ru |
| **API** | https://voensovet.ru:3001 |
| **Health Check** | https://voensovet.ru:3001/health |
| **GitHub** | https://github.com/sergiologino/voensovet |
| **Timeweb** | https://timeweb.cloud/my/app-platform |

---

## 🆘 ПОМОЩЬ

Если нужна помощь, смотрите документацию:

1. **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** ⚡ - Быстрый старт
2. **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** 📋 - Подробная инструкция
3. **[CORRECT_ENV_VARS.md](./CORRECT_ENV_VARS.md)** 🔐 - Переменные окружения
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** 🏗️ - Архитектура системы
5. **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** 📝 - Что было исправлено
6. **[README.md](./README.md)** 📖 - Общая информация

---

**Удачного деплоя! 🚀**



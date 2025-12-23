# ⚡ БЫСТРЫЙ ДЕПЛОЙ

## 🎯 ВАРИАНТ 1: Автоматический (PowerShell)

```powershell
cd E:\1_MyProjects\VOEBSOVET_RU\app2
.\deploy.ps1
```

Скрипт автоматически:
- ✅ Удалит lockfile'ы
- ✅ Закоммитит изменения
- ✅ Запушит на GitHub
- ✅ Покажет что делать дальше

---

## 🎯 ВАРИАНТ 2: Ручной

```bash
cd E:\1_MyProjects\VOEBSOVET_RU\app2

# Удаляем lockfile'ы
git rm package-lock.json
git rm server/package-lock.json

# Коммитим
git add Dockerfile server/Dockerfile .gitignore CORRECT_ENV_VARS.md DEPLOY_NOW.md
git commit -m "Fix: Use npm install, remove lockfiles, update URLs"
git push
```

---

## ⚙️ ОБНОВИТЕ ПЕРЕМЕННЫЕ В TIMEWEB

Зайдите в панель Timeweb → Переменные окружения:

### ❌ Исправьте:
```
VITE_API_URL=https://voensovet.ru/server  ← НЕПРАВИЛЬНО
```

### ✅ На:
```
VITE_API_URL=https://voensovet.ru:3001  ← ПРАВИЛЬНО
```

### ➕ Добавьте:
```
VITE_API_BASE_URL=https://voensovet.ru:3001/api
```

### 🔧 Исправьте (если есть):
```
YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback
```

---

## ✅ ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

1. **Frontend**: https://voensovet.ru
2. **Backend Health**: https://voensovet.ru:3001/health

Должен вернуть:
```json
{
  "status": "ok",
  "port": 3001,
  "database": { "host": true, "port": true, "name": true }
}
```

---

## 🆘 ЕСЛИ НЕ РАБОТАЕТ

Смотрите подробную инструкцию в:
- `DEPLOY_NOW.md` - пошаговая инструкция
- `CORRECT_ENV_VARS.md` - правильные переменные
- `DATABASE_INITIALIZATION.md` - настройка БД

---

## 📊 ЧТО ИСПРАВЛЕНО

1. ✅ `Dockerfile` → `npm install` вместо `npm ci`
2. ✅ `server/Dockerfile` → добавлен `--legacy-peer-deps`
3. ✅ `.gitignore` → добавлен `package-lock.json`
4. ✅ Документация → правильные URL с портом 3001

**Время деплоя: ~3-5 минут** ⏱️



# Скрипт деплоя для voensovet.ru
# Автоматически удаляет lockfile'ы и коммитит изменения

Write-Host "🚀 Начинаем деплой voensovet.ru..." -ForegroundColor Green
Write-Host ""

# Переходим в директорию проекта
Set-Location E:\1_MyProjects\VOEBSOVET_RU\app2

# Проверяем текущую ветку
Write-Host "📋 Текущая ветка:" -ForegroundColor Cyan
git branch --show-current
Write-Host ""

# Удаляем lockfile'ы из git (если они есть)
Write-Host "🗑️  Удаляем package-lock.json из git..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    git rm -f package-lock.json 2>$null
    Write-Host "✅ Удален package-lock.json" -ForegroundColor Green
}

if (Test-Path "server/package-lock.json") {
    git rm -f server/package-lock.json 2>$null
    Write-Host "✅ Удален server/package-lock.json" -ForegroundColor Green
}
Write-Host ""

# Добавляем изменения
Write-Host "📦 Добавляем изменения в git..." -ForegroundColor Yellow
git add Dockerfile
git add server/Dockerfile
git add .gitignore
git add CORRECT_ENV_VARS.md
git add DEPLOY_NOW.md
git add deploy.ps1
Write-Host "✅ Файлы добавлены" -ForegroundColor Green
Write-Host ""

# Показываем статус
Write-Host "📊 Статус git:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Коммитим
Write-Host "💾 Коммитим изменения..." -ForegroundColor Yellow
git commit -m "Fix: Use npm install instead of npm ci, remove lockfiles, update URLs to voensovet.ru:3001"
Write-Host ""

# Пушим
Write-Host "🚀 Отправляем на GitHub..." -ForegroundColor Yellow
git push
Write-Host ""

Write-Host "✅ ДЕПЛОЙ ЗАПУЩЕН!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 ЧТО ДАЛЬШЕ:" -ForegroundColor Cyan
Write-Host "1. Зайдите в панель Timeweb" -ForegroundColor White
Write-Host "2. Обновите переменные окружения:" -ForegroundColor White
Write-Host "   VITE_API_URL=https://voensovet.ru:3001" -ForegroundColor Yellow
Write-Host "   VITE_API_BASE_URL=https://voensovet.ru:3001/api" -ForegroundColor Yellow
Write-Host "   YANDEX_REDIRECT_URI=https://voensovet.ru:3001/api/auth/yandex/callback" -ForegroundColor Yellow
Write-Host "3. Следите за логами деплоя в Timeweb" -ForegroundColor White
Write-Host "4. После деплоя проверьте:" -ForegroundColor White
Write-Host "   - https://voensovet.ru (Frontend)" -ForegroundColor White
Write-Host "   - https://voensovet.ru:3001/health (Backend)" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Деплой займёт ~3-5 минут" -ForegroundColor Cyan
Write-Host ""

# Открываем браузер с панелью Timeweb (опционально)
$openBrowser = Read-Host "Открыть панель Timeweb в браузере? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://timeweb.cloud/my/app-platform"
}

Write-Host ""
Write-Host "✅ Готово! Удачного деплоя! 🎉" -ForegroundColor Green


# Серверная часть приложения

## Структура

Для успешной сборки Docker образа необходимо наличие следующих файлов:

```
server/
├── Dockerfile
├── package.json          # ⚠️ ОБЯЗАТЕЛЬНО
├── package-lock.json     # ⚠️ ОБЯЗАТЕЛЬНО
└── src/
    └── index.js          # ⚠️ ОБЯЗАТЕЛЬНО (точка входа)
```

## Проверка перед деплоем

Убедитесь, что:

1. ✅ Файл `package.json` существует в папке `server/`
2. ✅ Файл `package-lock.json` существует в папке `server/`
3. ✅ Папка `server/src/` содержит файлы сервера
4. ✅ Файл `server/src/index.js` (или другой файл точки входа) существует

## Если файлы отсутствуют

Если файлы сервера отсутствуют локально, но должны быть в git:

1. Проверьте, что файлы закоммичены в git:
   ```bash
   git ls-files server/
   ```

2. Если файлы не в git, добавьте их:
   ```bash
   git add server/package.json
   git add server/src/
   git commit -m "Add server files"
   git push
   ```

3. Если файлы в git, но не синхронизированы локально:
   ```bash
   git pull
   ```

## Dockerfile

Dockerfile ожидает стандартную структуру Node.js проекта:
- `package.json` с зависимостями
- `src/index.js` как точка входа (или измените CMD в Dockerfile)

Если структура отличается, обновите Dockerfile соответственно.



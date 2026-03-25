# Dockerfile для Node.js сервера

FROM node:18-alpine

WORKDIR /app

# Устанавливаем wget для health check
RUN apk add --no-cache wget

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
# Используем npm ci если есть package-lock.json, иначе npm install
RUN if [ -f package-lock.json ]; then npm ci --only=production --legacy-peer-deps; else npm install --only=production --legacy-peer-deps; fi

# Копируем исходный код
# ВАЖНО: Убедитесь, что папка src/ существует и содержит файлы сервера
COPY src ./src

# Переменные окружения будут переданы из настроек Timeweb
# Они доступны через process.env во время выполнения
# НЕ нужно указывать их здесь через ENV, если они передаются через настройки платформы

# Открываем порт
# Порт будет передан через переменную окружения из docker-compose
EXPOSE 3002

# Определяем точку входа
# Вариант 1: Если в package.json есть скрипт "start"
# CMD ["npm", "start"]

# Вариант 2: Прямой запуск (стандартный вариант)
CMD ["node", "src/index.js"]


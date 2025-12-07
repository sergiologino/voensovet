
# Docker Deployment Guide

## Быстрый старт

### Локальная сборка и запуск

```bash
# Собрать образ
docker build -t veteran-support-portal .

# Запустить контейнер
docker run -d -p 80:80 veteran-support-portal

# Приложение доступно на http://localhost
```

### Использование Docker Compose

```bash
# Запустить
docker-compose up -d

# Остановить
docker-compose down

# Просмотр логов
docker-compose logs -f
```

## Деплой на сервер

### Вариант 1: Прямой деплой из GitHub Container Registry

После пуша в main/master ветку, GitHub Actions автоматически соберет и опубликует образ.

На сервере выполните:

```bash
# Авторизация в GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Скачать образ
docker pull ghcr.io/USERNAME/REPO_NAME:latest

# Запустить контейнер
docker run -d \
  --name veteran-support \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/USERNAME/REPO_NAME:latest
```

### Вариант 2: Деплой через Docker Compose на сервере

1. Скопируйте `docker-compose.yml` на сервер
2. Создайте `.env` файл с настройками
3. Запустите:

```bash
docker-compose pull
docker-compose up -d
```

### Вариант 3: Использование Portainer, Coolify, или других платформ

Эти платформы поддерживают деплой из GitHub напрямую:

1. Подключите GitHub репозиторий
2. Укажите путь к Dockerfile
3. Настройте автоматический деплой при пуше

## Обновление приложения

```bash
# Скачать новую версию
docker pull ghcr.io/USERNAME/REPO_NAME:latest

# Остановить старый контейнер
docker stop veteran-support

# Удалить старый контейнер
docker rm veteran-support

# Запустить новый
docker run -d \
  --name veteran-support \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/USERNAME/REPO_NAME:latest
```

## Проверка здоровья приложения

```bash
# Health check endpoint
curl http://localhost/health

# Просмотр логов
docker logs veteran-support

# Просмотр логов в реальном времени
docker logs -f veteran-support
```

## Настройка SSL/HTTPS

Рекомендуется использовать reverse proxy (nginx, Caddy, Traefik) для SSL:

```nginx
# Пример nginx конфигурации
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Переменные окружения

Если нужно добавить переменные окружения:

```bash
docker run -d \
  --name veteran-support \
  -p 80:80 \
  -e NODE_ENV=production \
  -e API_URL=https://api.example.com \
  --restart unless-stopped \
  ghcr.io/USERNAME/REPO_NAME:latest
```

## Мониторинг

```bash
# Использование ресурсов
docker stats veteran-support

# Информация о контейнере
docker inspect veteran-support
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker logs veteran-support

# Проверить статус
docker ps -a
```

### Порт уже занят

```bash
# Использовать другой порт
docker run -d -p 8080:80 veteran-support-portal
```

### Проблемы с правами доступа

```bash
# Запустить с sudo или добавить пользователя в группу docker
sudo usermod -aG docker $USER
```

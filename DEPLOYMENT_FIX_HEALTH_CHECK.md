# Исправление Health Check для API контейнера

## Проблема

API контейнер падает с ошибкой `is unhealthy` потому что:

1. **`wget` не установлен** в `node:18-alpine` образе
2. Health check не может выполнить команду `wget`
3. Контейнер помечается как unhealthy
4. Frontend не запускается из-за `depends_on` с `condition: service_healthy`

## Что исправлено

### 1. Установлен wget в Dockerfile

```dockerfile
# Устанавливаем wget для health check
RUN apk add --no-cache wget
```

### 2. Упрощен depends_on

**Было**:
```yaml
depends_on:
  api:
    condition: service_healthy  # Ждет пока API станет healthy
```

**Стало**:
```yaml
depends_on:
  - api  # Просто ждет запуска контейнера
```

### 3. Улучшен health check

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
  interval: 10s      # Проверка каждые 10 сек
  timeout: 5s        # Таймаут 5 сек
  retries: 5         # 5 попыток
  start_period: 10s  # Ждем 10 сек перед первой проверкой
```

## Порядок запуска

1. **API контейнер** запускается первым
2. Health check начинает проверки через 10 секунд
3. **Web контейнер** запускается сразу после запуска API (не ждет healthy)
4. Оба контейнера работают параллельно

## Проверка работы

### В логах должно быть:

```
=== Server Starting ===
PORT: 3001
NODE_ENV: production
DB_HOST: [SET]
...
======================
✅ Server is running on port 3001
✅ Environment: production
✅ Health check: http://localhost:3001/health
```

### Проверка health check:

```bash
# Внутри контейнера
docker exec <container-id> wget --quiet --tries=1 --spider http://localhost:3001/health
echo $?  # Должно быть 0

# Снаружи
docker ps  # Должен показать (healthy) для api контейнера
```

## Альтернативное решение: curl вместо wget

Если wget не работает, можно использовать curl:

```dockerfile
# Устанавливаем curl для health check
RUN apk add --no-cache curl
```

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
```

## Чеклист перед деплоем

- [ ] `wget` установлен в `server/Dockerfile`
- [ ] Health check использует правильный порт (3001)
- [ ] `depends_on` без `condition: service_healthy`
- [ ] Изменения закоммичены:
  ```bash
  git add server/Dockerfile docker-compose.yml
  git commit -m "Fix health check: install wget and simplify depends_on"
  git push
  ```
- [ ] Переразверните на Timeweb

## Ожидаемый результат

После деплоя:
- ✅ API контейнер запустится успешно
- ✅ Health check будет проходить
- ✅ Web контейнер запустится
- ✅ Оба сервиса будут работать


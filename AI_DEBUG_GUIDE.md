# 🤖 ОТЛАДКА AI АССИСТЕНТА

## 🐛 ПРОБЛЕМА

При обращении к нейроассистенту возвращается ошибка:
```
Ошибка при обработке запроса
/api/ai/process: 500 Internal Server Error
```

---

## 🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ

### 1. ❌ Пользователь не авторизован

**Проблема**: Роут `/api/ai/process` требует авторизации (JWT токен).

**Симптомы**:
- В логах backend: `User: NOT AUTHENTICATED`
- Или ошибка: `Cannot read property 'id' of undefined`

**Решение**: 
- Убедитесь что пользователь **залогинен**
- Проверьте что токен сохранён в `localStorage`
- Проверьте что токен отправляется в заголовке `Authorization: Bearer <token>`

### 2. ❌ Не установлена переменная `AI_SERVICE_API_KEY`

**Проблема**: Backend не может обратиться к AI сервису без API ключа.

**Симптомы**:
- В логах: `🔍 Checking AI_API_KEY: [NOT SET]`
- В логах: `❌ AI Service API Key не настроен!`
- Ошибка: `AI Service API Key не настроен. Обратитесь к администратору.`

**Решение**:
В Timeweb добавьте переменную окружения:
```env
AI_SERVICE_API_KEY=5DDE26C2196CB9FA56A4DF5B466C7E2D2C1FA62BA10BDA1B
```

### 3. ❌ AI сервис недоступен

**Проблема**: AI сервис не отвечает или вернул ошибку.

**Симптомы**:
- В логах: `🌐 Fetching available networks from AI service: https://...`
- Потом ошибка: `ECONNREFUSED` или `ETIMEDOUT`
- Или: `404 Not Found` / `401 Unauthorized`

**Решение**:
- Проверьте что AI сервис запущен: https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net/health
- Проверьте что API ключ правильный
- Проверьте URL: `AI_SERVICE_URL`

### 4. ❌ Ошибка в базе данных

**Проблема**: Не удалось получить данные пользователя или настройки админа.

**Симптомы**:
- В логах: `👤 Fetching user data...`
- Потом ошибка SQL

**Решение**:
- Проверьте что таблицы `users` и `admin_settings` существуют
- Проверьте что пользователь существует в БД

---

## 📊 КАК ЧИТАТЬ ЛОГИ

После добавления отладки, в логах backend будет:

### ✅ Успешный запрос:
```
🤖 AI process request received
User: ID: 1
Body: { userQuery: 'Какие льготы положены военнослужащим?...', regionName: undefined }
🔑 Getting API key...
🔍 Checking AI_API_KEY: [SET]
✅ API key obtained
👤 Fetching user data...
✅ User data fetched: { userName: 'Иван Иванов', phone: '+79991234567', email: null }
📋 Fetching admin settings...
✅ Admin settings fetched
🌐 Fetching available networks from AI service: https://...
✅ Networks fetched: 2 networks available
Используем сети: первая (приоритет 90) - gpt-4o-mini, вторая (приоритет 100) - gpt-4o
🚀 Sending primary request to AI service...
✅ Primary response received
🚀 Sending secondary request to AI service...
✅ Secondary response received
💾 Saving AI request to database...
✅ AI request saved
✅ Response sent to client
```

### ❌ Если НЕ авторизован:
```
🤖 AI process request received
User: NOT AUTHENTICATED
❌ Cannot read property 'id' of undefined
```

### ❌ Если НЕТ API ключа:
```
🤖 AI process request received
User: ID: 1
🔑 Getting API key...
🔍 Checking AI_API_KEY: [NOT SET]
❌ AI Service API Key не настроен!
Error: AI Service API Key не настроен. Обратитесь к администратору.
```

### ❌ Если AI сервис недоступен:
```
🤖 AI process request received
User: ID: 1
🔑 Getting API key...
✅ API key obtained
👤 Fetching user data...
✅ User data fetched
📋 Fetching admin settings...
✅ Admin settings fetched
🌐 Fetching available networks from AI service: https://...
❌ AI process error: connect ECONNREFUSED
```

---

## 🧪 ПОШАГОВАЯ ДИАГНОСТИКА

### ШАГ 1: Проверьте что пользователь авторизован

Откройте DevTools (F12) → Application → Local Storage:
```
https://voensovet.ru
  └─ token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Если токена нет → **войдите в систему**.

### ШАГ 2: Проверьте запрос в Network

DevTools (F12) → Network → попробуйте отправить вопрос AI:

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

Если `Authorization` отсутствует → проблема с отправкой токена.

**Request Payload:**
```json
{
  "userQuery": "Какие льготы положены военнослужащим?",
  "regionName": undefined
}
```

**Response (если ошибка):**
```json
{
  "error": "Ошибка при обработке запроса",
  "details": "..."
}
```

### ШАГ 3: Откройте логи backend в Timeweb

1. Откройте https://timeweb.cloud/my/app-platform
2. Выберите приложение `voensovet`
3. Откройте **Логи** контейнера `api`
4. Попробуйте отправить вопрос AI
5. Смотрите логи в реальном времени

Ищите:
- `🤖 AI process request received` ← начало обработки
- `User: ID: X` ← пользователь авторизован
- `User: NOT AUTHENTICATED` ← НЕ авторизован
- `❌ AI Service API Key не настроен!` ← нет API ключа
- `❌ AI process error: ...` ← текст ошибки

### ШАГ 4: Проверьте переменные окружения в Timeweb

Откройте **Переменные окружения** в Timeweb:

```env
✅ AI_SERVICE_URL=https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net
✅ AI_SERVICE_API_KEY=5DDE26C2196CB9FA56A4DF5B466C7E2D2C1FA62BA10BDA1B
```

Если `AI_SERVICE_API_KEY` отсутствует → **добавьте её!**

### ШАГ 5: Проверьте доступность AI сервиса

Откройте в браузере:
```
https://sergiologino-zettelkastenapp-ai-integration-bce3.twc1.net/health
```

Должен вернуть `200 OK` с JSON.

Если `404` или `503` → AI сервис недоступен.

---

## ✅ РЕШЕНИЕ ДЛЯ КАЖДОЙ ОШИБКИ

### Ошибка: "User: NOT AUTHENTICATED"

**Решение:**
1. Убедитесь что вы вошли в систему
2. Проверьте что токен есть в localStorage
3. Обновите страницу

### Ошибка: "AI Service API Key не настроен"

**Решение:**
1. Откройте Timeweb → Переменные окружения
2. Добавьте:
   ```env
   AI_SERVICE_API_KEY=5DDE26C2196CB9FA56A4DF5B466C7E2D2C1FA62BA10BDA1B
   ```
3. Пересоберите приложение (или дождитесь автоматического деплоя)

### Ошибка: "connect ECONNREFUSED" / "ETIMEDOUT"

**Решение:**
1. Проверьте что AI сервис запущен
2. Проверьте URL: `AI_SERVICE_URL`
3. Проверьте сеть / файрвол

### Ошибка: "401 Unauthorized" от AI сервиса

**Решение:**
1. Проверьте что API ключ правильный
2. Проверьте срок действия ключа
3. Перегенерируйте ключ в AI сервисе

---

## 📋 CHECKLIST ОТЛАДКИ

- [ ] Пользователь авторизован (есть токен в localStorage)
- [ ] Токен отправляется в заголовке запроса
- [ ] `AI_SERVICE_API_KEY` установлена в Timeweb
- [ ] `AI_SERVICE_URL` установлен правильно
- [ ] AI сервис доступен (health check возвращает 200)
- [ ] Таблицы `users` и `admin_settings` существуют в БД
- [ ] Логи backend показывают где именно ошибка
- [ ] Если ошибка от AI сервиса - проверьте его логи

---

## 🆘 ЕСЛИ НЕ ПОМОГЛО

**Скопируйте логи backend** (первые 50-100 строк после попытки отправить вопрос) и отправьте мне.

Я увижу:
- На каком шаге упал запрос
- Какая именно ошибка
- Что нужно исправить

---

**ПОСЛЕ ДЕПЛОЯ (~3-4 МИНУТЫ) ПРОВЕРЬТЕ ЛОГИ!** 📋



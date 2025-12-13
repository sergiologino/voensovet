# Настройка переменных окружения для серверной части

## Важно: Dockerfile для сервера

Убедитесь, что в папке `server/` есть файл `Dockerfile`. Если его нет, создайте его по образцу ниже.

## Быстрая инструкция

### 1. В панели Timeweb

Добавьте переменные окружения в раздел "Переменные окружения" **БЕЗ префикса `VITE_`**:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key-here
API_KEY=your-api-key
NODE_ENV=production
PORT=3000
```

### 2. В коде сервера

Используйте `process.env` для доступа к переменным:

```javascript
// Пример: src/config/database.js
const dbConfig = {
  url: process.env.DATABASE_URL,
  // ...
};

// Пример: src/middleware/auth.js
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET не установлена в переменных окружения');
}
```

### 3. Проверка переменных

Создайте утилиту для проверки обязательных переменных при старте:

```javascript
// src/utils/checkEnv.js
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  // добавьте другие обязательные переменные
];

function checkEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Отсутствуют обязательные переменные окружения:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ Все обязательные переменные окружения установлены');
}

module.exports = { checkEnv };
```

Используйте в начале `src/index.js`:

```javascript
const { checkEnv } = require('./utils/checkEnv');

// Проверяем переменные перед запуском
checkEnv();

// Остальной код...
```

## Частые проблемы

### Проблема: Переменные не читаются

**Решение:**
1. Убедитесь, что переменные добавлены в панели Timeweb в разделе "Переменные окружения"
2. Проверьте, что переменные **НЕ** начинаются с `VITE_` (это только для клиента)
3. Перезапустите приложение после добавления переменных
4. Проверьте логи контейнера: `docker logs <container-name>`

### Проблема: Переменные доступны, но пустые

**Решение:**
1. Проверьте, что в панели Timeweb значения переменных не пустые
2. Убедитесь, что нет лишних пробелов в значениях
3. Проверьте, что переменные не переопределяются в Dockerfile

### Проблема: Переменные работают локально, но не на сервере

**Решение:**
1. Локально переменные читаются из файла `.env`
2. На сервере они должны быть в настройках Timeweb
3. Убедитесь, что добавили все необходимые переменные в Timeweb

## Пример структуры

```
server/
├── src/
│   ├── index.js          # Точка входа, проверяет env
│   ├── config/
│   │   ├── database.js   # Использует DATABASE_URL
│   │   └── auth.js       # Использует JWT_SECRET
│   └── utils/
│       └── checkEnv.js   # Утилита проверки env
├── Dockerfile
└── package.json
```

## Дополнительные советы

1. **Используйте значения по умолчанию:**
   ```javascript
   const port = process.env.PORT || 3000;
   ```

2. **Валидируйте переменные:**
   ```javascript
   const dbUrl = process.env.DATABASE_URL;
   if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
     throw new Error('Некорректный DATABASE_URL');
   }
   ```

3. **Не логируйте секретные значения:**
   ```javascript
   // ❌ Плохо
   console.log('JWT_SECRET:', process.env.JWT_SECRET);
   
   // ✅ Хорошо
   console.log('JWT_SECRET установлена:', !!process.env.JWT_SECRET);
   ```


/**
 * Утилита для работы с переменными окружения
 * 
 * Все переменные окружения для Vite должны начинаться с префикса VITE_
 * Они доступны через import.meta.env
 */

/**
 * Получить значение переменной окружения
 * @param key - ключ переменной (без префикса VITE_)
 * @param defaultValue - значение по умолчанию, если переменная не установлена
 * @returns значение переменной или значение по умолчанию
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[`VITE_${key}`];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    console.warn(`Переменная окружения VITE_${key} не установлена`);
    return '';
  }
  return value as string;
}

/**
 * Проверить, установлена ли переменная окружения
 * @param key - ключ переменной (без префикса VITE_)
 * @returns true, если переменная установлена и не пуста
 */
export function hasEnv(key: string): boolean {
  const value = import.meta.env[`VITE_${key}`];
  return value !== undefined && value !== '';
}

/**
 * Получить все переменные окружения (только для отладки)
 * @returns объект с переменными окружения
 */
export function getAllEnv(): Record<string, any> {
  return import.meta.env;
}

// Примеры использования:
// const apiUrl = getEnv('API_URL', 'http://localhost:3000');
// const apiBaseUrl = getEnv('API_BASE_URL');
// if (hasEnv('API_URL')) { ... }


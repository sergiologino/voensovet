/** Продакшен-домен для канонических URL и статических файлов (robots/sitemap). */
export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL || 'https://voensovet.ru'
).replace(/\/$/, '');

export const DEFAULT_SITE_KEYWORDS =
  'военнослужащие, участники СВО, ветераны, семьи военнослужащих, льготы, права, психологическая помощь, юридическая помощь, Военсовет, voensovet';

import { DEFAULT_SITE_KEYWORDS } from './site';

export type RouteSeoMeta = {
  title: string;
  description: string;
  keywords: string;
  /** Фрагмент без `#` (совпадает с hash-маршрутом приложения). */
  hash: string;
  noindex?: boolean;
};

/**
 * Мета для каждого ключа страницы из `App.tsx` (`currentPage`).
 * При добавлении страницы — добавить запись и проверить тест `routeSeo.test.ts`.
 */
export const SEO_BY_PAGE: Record<string, RouteSeoMeta> = {
  welcome: {
    hash: 'welcome',
    title: 'Voensovet — помощник и проводник',
    description:
      'Помогаем разобраться после службы и в сложных ситуациях. Для военных, участников СВО и их семей. ИИ-ассистент и проверенная информация.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, помощник Комбат, адаптация после службы`,
  },
  home: {
    hash: 'home',
    title: 'Главная',
    description:
      'Портал поддержки военнослужащих и их семей: помощь, права, льготы, организации и ИИ-консультант. Конфиденциально.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, главная портала, поддержка ветеранов`,
  },
  help: {
    hash: 'help',
    title: 'Помощь',
    description:
      'Психологическая, медицинская, социальная и юридическая помощь военнослужащим и семьям: горячие линии и организации.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, горячая линия, ПТСР, реабилитация`,
  },
  'contract-service': {
    hash: 'contract-service',
    title: 'Военная контрактная служба',
    description:
      'Информация о контрактной службе, правах и порядке обращения в военную контрактную службу для военнослужащих.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, контрактная служба, права военнослужащего`,
  },
  veteran: {
    hash: 'veteran',
    title: 'Вернувшимся из зоны боевых действий',
    description:
      'Адаптация после службы: права, льготы, медицина, работа и поддержка для военнослужащих, вернувшихся из зоны боевых действий.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, адаптация, демобилизация, реабилитация участника`,
  },
  family: {
    hash: 'family',
    title: 'Семьям военнослужащих',
    description:
      'Поддержка родственников военнослужащих: социальные меры, консультации и полезные контакты.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, семья военного, социальная поддержка семьи`,
  },
  bereaved: {
    hash: 'bereaved',
    title: 'Семьям погибших',
    description:
      'Память и поддержка семьям погибших военнослужащих: меры помощи, выплаты и организации.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, семья погибшего, выплаты, социальная защита`,
  },
  benefits: {
    hash: 'benefits',
    title: 'Права и льготы',
    description:
      'Обзор прав и льгот для военнослужащих, ветеранов и членов семей: выплаты, жильё, медицина.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, льготы участникам, выплаты, жильё военным`,
  },
  complaints: {
    hash: 'complaints',
    title: 'Жалобы и обращения',
    description:
      'Как безопасно подать жалобу или обращение по вопросам службы, медицины или нарушений прав.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, жалоба военнослужащего, обращение, защита прав`,
  },
  organizations: {
    hash: 'organizations',
    title: 'Организации помощи',
    description:
      'Каталог организаций и служб, помогающих военнослужащим и семьям в разных регионах.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, НКО, фонды помощи, госструктуры`,
  },
  return: {
    hash: 'return',
    title: 'Возвращение к жизни',
    description:
      'Шаги к восстановлению после службы: работа, учёба, здоровье и социальная адаптация.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, трудоустройство ветеранов, адаптация`,
  },
  profile: {
    hash: 'profile',
    title: 'Личный кабинет',
    description:
      'Личный кабинет пользователя портала Военсовет: профиль, история обращений и диалогов с ассистентом.',
    keywords: `${DEFAULT_SITE_KEYWORDS}, личный кабинет`,
    noindex: true,
  },
  admin: {
    hash: 'admin',
    title: 'Панель администратора',
    description: 'Административная панель портала поддержки военнослужащих.',
    keywords: `${DEFAULT_SITE_KEYWORDS}`,
    noindex: true,
  },
  'auth-callback': {
    hash: 'auth-callback',
    title: 'Вход',
    description: 'Завершение авторизации на портале Военсовет.',
    keywords: `${DEFAULT_SITE_KEYWORDS}`,
    noindex: true,
  },
};

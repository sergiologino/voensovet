// Актуальный список субъектов Российской Федерации (89 регионов)
// Включая ДНР, ЛНР, Запорожскую и Херсонскую области

export interface Region {
  id: string;
  name: string;
  federalDistrict: string;
}

export const regions: Region[] = [
  // Центральный федеральный округ
  { id: 'moscow', name: 'Москва', federalDistrict: 'Центральный' },
  { id: 'moscow_oblast', name: 'Московская область', federalDistrict: 'Центральный' },
  { id: 'belgorod', name: 'Белгородская область', federalDistrict: 'Центральный' },
  { id: 'bryansk', name: 'Брянская область', federalDistrict: 'Центральный' },
  { id: 'vladimir', name: 'Владимирская область', federalDistrict: 'Центральный' },
  { id: 'voronezh', name: 'Воронежская область', federalDistrict: 'Центральный' },
  { id: 'ivanovo', name: 'Ивановская область', federalDistrict: 'Центральный' },
  { id: 'kaluga', name: 'Калужская область', federalDistrict: 'Центральный' },
  { id: 'kostroma', name: 'Костромская область', federalDistrict: 'Центральный' },
  { id: 'kursk', name: 'Курская область', federalDistrict: 'Центральный' },
  { id: 'lipetsk', name: 'Липецкая область', federalDistrict: 'Центральный' },
  { id: 'oryol', name: 'Орловская область', federalDistrict: 'Центральный' },
  { id: 'ryazan', name: 'Рязанская область', federalDistrict: 'Центральный' },
  { id: 'smolensk', name: 'Смоленская область', federalDistrict: 'Центральный' },
  { id: 'tambov', name: 'Тамбовская область', federalDistrict: 'Центральный' },
  { id: 'tver', name: 'Тверская область', federalDistrict: 'Центральный' },
  { id: 'tula', name: 'Тульская область', federalDistrict: 'Центральный' },
  { id: 'yaroslavl', name: 'Ярославская область', federalDistrict: 'Центральный' },

  // Северо-Западный федеральный округ
  { id: 'spb', name: 'Санкт-Петербург', federalDistrict: 'Северо-Западный' },
  { id: 'leningrad_oblast', name: 'Ленинградская область', federalDistrict: 'Северо-Западный' },
  { id: 'arkhangelsk', name: 'Архангельская область', federalDistrict: 'Северо-Западный' },
  { id: 'vologda', name: 'Вологодская область', federalDistrict: 'Северо-Западный' },
  { id: 'kaliningrad', name: 'Калининградская область', federalDistrict: 'Северо-Западный' },
  { id: 'karelia', name: 'Республика Карелия', federalDistrict: 'Северо-Западный' },
  { id: 'komi', name: 'Республика Коми', federalDistrict: 'Северо-Западный' },
  { id: 'murmansk', name: 'Мурманская область', federalDistrict: 'Северо-Западный' },
  { id: 'nao', name: 'Ненецкий автономный округ', federalDistrict: 'Северо-Западный' },
  { id: 'novgorod', name: 'Новгородская область', federalDistrict: 'Северо-Западный' },
  { id: 'pskov', name: 'Псковская область', federalDistrict: 'Северо-Западный' },

  // Южный федеральный округ
  { id: 'adygea', name: 'Республика Адыгея', federalDistrict: 'Южный' },
  { id: 'astrakhan', name: 'Астраханская область', federalDistrict: 'Южный' },
  { id: 'volgograd', name: 'Волгоградская область', federalDistrict: 'Южный' },
  { id: 'kalmykia', name: 'Республика Калмыкия', federalDistrict: 'Южный' },
  { id: 'krasnodar', name: 'Краснодарский край', federalDistrict: 'Южный' },
  { id: 'crimea', name: 'Республика Крым', federalDistrict: 'Южный' },
  { id: 'rostov', name: 'Ростовская область', federalDistrict: 'Южный' },
  { id: 'sevastopol', name: 'Севастополь', federalDistrict: 'Южный' },
  // Новые регионы
  { id: 'dpr', name: 'Донецкая Народная Республика', federalDistrict: 'Южный' },
  { id: 'lpr', name: 'Луганская Народная Республика', federalDistrict: 'Южный' },
  { id: 'zaporozhye', name: 'Запорожская область', federalDistrict: 'Южный' },
  { id: 'kherson', name: 'Херсонская область', federalDistrict: 'Южный' },

  // Северо-Кавказский федеральный округ
  { id: 'dagestan', name: 'Республика Дагестан', federalDistrict: 'Северо-Кавказский' },
  { id: 'ingushetia', name: 'Республика Ингушетия', federalDistrict: 'Северо-Кавказский' },
  { id: 'kabardino_balkaria', name: 'Кабардино-Балкарская Республика', federalDistrict: 'Северо-Кавказский' },
  { id: 'karachaevo_cherkessia', name: 'Карачаево-Черкесская Республика', federalDistrict: 'Северо-Кавказский' },
  { id: 'north_ossetia', name: 'Республика Северная Осетия — Алания', federalDistrict: 'Северо-Кавказский' },
  { id: 'chechnya', name: 'Чеченская Республика', federalDistrict: 'Северо-Кавказский' },
  { id: 'stavropol', name: 'Ставропольский край', federalDistrict: 'Северо-Кавказский' },

  // Приволжский федеральный округ
  { id: 'bashkortostan', name: 'Республика Башкортостан', federalDistrict: 'Приволжский' },
  { id: 'kirov', name: 'Кировская область', federalDistrict: 'Приволжский' },
  { id: 'mari_el', name: 'Республика Марий Эл', federalDistrict: 'Приволжский' },
  { id: 'mordovia', name: 'Республика Мордовия', federalDistrict: 'Приволжский' },
  { id: 'nizhny_novgorod', name: 'Нижегородская область', federalDistrict: 'Приволжский' },
  { id: 'orenburg', name: 'Оренбургская область', federalDistrict: 'Приволжский' },
  { id: 'penza', name: 'Пензенская область', federalDistrict: 'Приволжский' },
  { id: 'perm', name: 'Пермский край', federalDistrict: 'Приволжский' },
  { id: 'samara', name: 'Самарская область', federalDistrict: 'Приволжский' },
  { id: 'saratov', name: 'Саратовская область', federalDistrict: 'Приволжский' },
  { id: 'tatarstan', name: 'Республика Татарстан', federalDistrict: 'Приволжский' },
  { id: 'udmurtia', name: 'Удмуртская Республика', federalDistrict: 'Приволжский' },
  { id: 'ulyanovsk', name: 'Ульяновская область', federalDistrict: 'Приволжский' },
  { id: 'chuvashia', name: 'Чувашская Республика', federalDistrict: 'Приволжский' },

  // Уральский федеральный округ
  { id: 'kurgan', name: 'Курганская область', federalDistrict: 'Уральский' },
  { id: 'sverdlovsk', name: 'Свердловская область', federalDistrict: 'Уральский' },
  { id: 'tyumen', name: 'Тюменская область', federalDistrict: 'Уральский' },
  { id: 'khanty_mansi', name: 'Ханты-Мансийский автономный округ — Югра', federalDistrict: 'Уральский' },
  { id: 'chelyabinsk', name: 'Челябинская область', federalDistrict: 'Уральский' },
  { id: 'yamalo_nenets', name: 'Ямало-Ненецкий автономный округ', federalDistrict: 'Уральский' },

  // Сибирский федеральный округ
  { id: 'altai_republic', name: 'Республика Алтай', federalDistrict: 'Сибирский' },
  { id: 'altai_krai', name: 'Алтайский край', federalDistrict: 'Сибирский' },
  { id: 'irkutsk', name: 'Иркутская область', federalDistrict: 'Сибирский' },
  { id: 'kemerovo', name: 'Кемеровская область — Кузбасс', federalDistrict: 'Сибирский' },
  { id: 'krasnoyarsk', name: 'Красноярский край', federalDistrict: 'Сибирский' },
  { id: 'novosibirsk', name: 'Новосибирская область', federalDistrict: 'Сибирский' },
  { id: 'omsk', name: 'Омская область', federalDistrict: 'Сибирский' },
  { id: 'tomsk', name: 'Томская область', federalDistrict: 'Сибирский' },
  { id: 'tuva', name: 'Республика Тыва', federalDistrict: 'Сибирский' },
  { id: 'khakassia', name: 'Республика Хакасия', federalDistrict: 'Сибирский' },

  // Дальневосточный федеральный округ
  { id: 'amur', name: 'Амурская область', federalDistrict: 'Дальневосточный' },
  { id: 'buryatia', name: 'Республика Бурятия', federalDistrict: 'Дальневосточный' },
  { id: 'jewish_ao', name: 'Еврейская автономная область', federalDistrict: 'Дальневосточный' },
  { id: 'zabaykalsky', name: 'Забайкальский край', federalDistrict: 'Дальневосточный' },
  { id: 'kamchatka', name: 'Камчатский край', federalDistrict: 'Дальневосточный' },
  { id: 'magadan', name: 'Магаданская область', federalDistrict: 'Дальневосточный' },
  { id: 'primorsky', name: 'Приморский край', federalDistrict: 'Дальневосточный' },
  { id: 'sakha', name: 'Республика Саха (Якутия)', federalDistrict: 'Дальневосточный' },
  { id: 'sakhalin', name: 'Сахалинская область', federalDistrict: 'Дальневосточный' },
  { id: 'khabarovsk', name: 'Хабаровский край', federalDistrict: 'Дальневосточный' },
  { id: 'chukotka', name: 'Чукотский автономный округ', federalDistrict: 'Дальневосточный' },
];

// Получить регион по ID
export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id);
}

// Получить регион по названию (для поиска)
export function getRegionByName(name: string): Region | undefined {
  return regions.find((r) => r.name.toLowerCase() === name.toLowerCase());
}

// Поиск регионов по тексту
export function searchRegions(query: string): Region[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return regions;
  
  return regions.filter(
    (r) =>
      r.name.toLowerCase().includes(normalizedQuery) ||
      r.federalDistrict.toLowerCase().includes(normalizedQuery)
  );
}

// Группировка регионов по федеральным округам
export function getRegionsByDistrict(): Record<string, Region[]> {
  return regions.reduce((acc, region) => {
    if (!acc[region.federalDistrict]) {
      acc[region.federalDistrict] = [];
    }
    acc[region.federalDistrict].push(region);
    return acc;
  }, {} as Record<string, Region[]>);
}

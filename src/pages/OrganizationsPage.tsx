import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import {
  BuildingIcon,
  SearchIcon,
  PhoneIcon,
  GlobeIcon,
  MapPinIcon,
  ExternalLinkIcon,
  StarIcon,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  type: 'government' | 'fund' | 'ngo' | 'medical';
  description: string;
  phone?: string;
  website?: string;
  address?: string;
  services: string[];
  isMain?: boolean;
}

export function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const types = [
    { id: 'all', name: 'Все организации' },
    { id: 'government', name: 'Государственные' },
    { id: 'fund', name: 'Фонды' },
    { id: 'ngo', name: 'НКО и объединения' },
    { id: 'medical', name: 'Медицинские' },
  ];

  const organizations: Organization[] = [
    {
      id: '1',
      name: 'Фонд «Защитники Отечества»',
      type: 'fund',
      description:
        'Государственный фонд координации помощи ветеранам СВО и членам их семей. Персональные кураторы, помощь в оформлении льгот, социальная и психологическая поддержка.',
      phone: '8-800-200-34-11',
      website: 'https://фондзащитниковотечества.рф',
      services: [
        'Персональные кураторы',
        'Оформление льгот',
        'Психологическая помощь',
        'Юридические консультации',
        'Социальная поддержка',
      ],
      isMain: true,
    },
    {
      id: '2',
      name: 'Министерство обороны РФ',
      type: 'government',
      description:
        'Официальный орган исполнительной власти, ответственный за оборону страны. Вопросы прохождения службы, денежного довольствия, жилищного обеспечения.',
      phone: '8-495-498-51-90',
      website: 'https://mil.ru',
      services: [
        'Денежное довольствие',
        'Жилищное обеспечение',
        'Социальные гарантии',
        'Контрактная служба',
      ],
    },
    {
      id: '3',
      name: 'Пенсионный фонд России',
      type: 'government',
      description:
        'Оформление и выплата пенсий, ЕДВ, социальных выплат ветеранам боевых действий и членам семей погибших.',
      phone: '8-800-600-44-44',
      website: 'https://pfr.gov.ru',
      services: [
        'Пенсии',
        'Ежемесячные денежные выплаты',
        'Компенсации',
        'Материнский капитал',
      ],
    },
    {
      id: '4',
      name: 'Фонд социального страхования',
      type: 'government',
      description:
        'Обеспечение техническими средствами реабилитации, протезирование, санаторно-курортное лечение.',
      phone: '8-800-302-75-49',
      website: 'https://fss.ru',
      services: [
        'Протезирование',
        'Средства реабилитации',
        'Санаторное лечение',
        'Компенсации',
      ],
    },
    {
      id: '5',
      name: 'Комитет семей воинов Отечества',
      type: 'ngo',
      description:
        'Общественная организация, объединяющая семьи военнослужащих. Гуманитарная помощь, поддержка семей, взаимодействие с властями.',
      website: 'https://ksvo.ru',
      services: [
        'Гуманитарная помощь',
        'Поддержка семей',
        'Поиск пропавших',
        'Взаимодействие с властями',
      ],
    },
    {
      id: '6',
      name: 'Российский Красный Крест',
      type: 'ngo',
      description:
        'Гуманитарная помощь, поиск родственников, психологическая поддержка, помощь в экстренных ситуациях.',
      phone: '8-495-621-04-30',
      website: 'https://redcross.ru',
      services: [
        'Гуманитарная помощь',
        'Поиск родственников',
        'Психологическая поддержка',
        'Медицинская помощь',
      ],
    },
    {
      id: '7',
      name: 'Центр медицинской реабилитации',
      type: 'medical',
      description:
        'Комплексная медицинская реабилитация военнослужащих и ветеранов. Восстановление после ранений, протезирование.',
      phone: '8-495-123-45-67',
      services: [
        'Медицинская реабилитация',
        'Протезирование',
        'Физиотерапия',
        'Психологическая помощь',
      ],
    },
    {
      id: '8',
      name: 'Военный госпиталь им. Бурденко',
      type: 'medical',
      description:
        'Главный военный клинический госпиталь. Высокотехнологичная медицинская помощь военнослужащим и ветеранам.',
      phone: '8-499-263-53-00',
      website: 'https://gvkg.ru',
      address: 'Москва, Госпитальная площадь, д. 3',
      services: [
        'Хирургия',
        'Терапия',
        'Реабилитация',
        'Диагностика',
      ],
    },
    {
      id: '9',
      name: 'Союз ветеранов',
      type: 'ngo',
      description:
        'Всероссийская общественная организация ветеранов. Защита прав, социальная поддержка, патриотическое воспитание.',
      website: 'https://veteranrus.ru',
      services: [
        'Защита прав',
        'Социальная поддержка',
        'Юридическая помощь',
        'Мероприятия',
      ],
    },
    {
      id: '10',
      name: 'Центр занятости для ветеранов',
      type: 'government',
      description:
        'Специализированная служба по трудоустройству ветеранов боевых действий. Переподготовка, вакансии, карьерное консультирование.',
      phone: '8-800-350-00-00',
      services: [
        'Трудоустройство',
        'Переподготовка',
        'Карьерное консультирование',
        'База вакансий',
      ],
    },
  ];

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || org.type === selectedType;
    return matchesSearch && matchesType;
  });

  const mainOrg = organizations.find((org) => org.isMain);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      government: 'Государственная',
      fund: 'Фонд',
      ngo: 'НКО',
      medical: 'Медицинская',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      government: 'bg-[#dbeafe] text-[#1e40af]',
      fund: 'bg-[#fef3c7] text-[#b45309]',
      ngo: 'bg-[#f0fdf4] text-[#166534]',
      medical: 'bg-[#fce7f3] text-[#be185d]',
    };
    return colors[type] || 'bg-[#f5f5f5] text-[#525252]';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f0f4f8] rounded-lg px-4 py-2 mb-4">
              <BuildingIcon size={20} className="text-[#2c5f8d]" />
              <span className="text-sm font-medium text-[#2c5f8d]">
                Справочник организаций
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Организации помощи
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Каталог государственных и общественных организаций, оказывающих помощь 
              ветеранам боевых действий и членам их семей.
            </p>
          </div>

          {/* Main Organization Highlight */}
          {mainOrg && (
            <div className="bg-gradient-to-r from-[#2c5f8d] to-[#1e4976] rounded-3xl p-6 lg:p-8 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-white/90">
                  Главная организация поддержки
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                {mainOrg.name}
              </h2>
              <p className="text-white/80 mb-6 max-w-2xl">{mainOrg.description}</p>
              <div className="flex flex-wrap gap-4">
                {mainOrg.phone && (
                  <a
                    href={`tel:${mainOrg.phone.replace(/-/g, '')}`}
                    className="inline-flex items-center gap-2 bg-white text-[#2c5f8d] px-5 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors"
                  >
                    <PhoneIcon size={18} />
                    {mainOrg.phone}
                  </a>
                )}
                {mainOrg.website && (
                  <a
                    href={mainOrg.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors"
                  >
                    <GlobeIcon size={18} />
                    Перейти на сайт
                    <ExternalLinkIcon size={16} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#737373]"
                size={20}
              />
              <Input
                placeholder="Поиск организаций..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type.id
                      ? 'bg-[#2c5f8d] text-white'
                      : 'bg-[#f5f5f5] text-[#525252] hover:bg-[#e5e5e5]'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Organizations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrganizations
              .filter((org) => !org.isMain)
              .map((org) => (
                <div
                  key={org.id}
                  className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6 hover:border-[#2c5f8d] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-[#262626]">{org.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(
                        org.type
                      )}`}
                    >
                      {getTypeLabel(org.type)}
                    </span>
                  </div>
                  <p className="text-sm text-[#525252] mb-4 leading-relaxed">
                    {org.description}
                  </p>

                  {/* Services */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {org.services.slice(0, 4).map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 bg-[#f5f5f5] rounded-md text-xs text-[#737373]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Contacts */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-[#e5e5e5]">
                    {org.phone && (
                      <a
                        href={`tel:${org.phone.replace(/-/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-sm text-[#2c5f8d] hover:underline"
                      >
                        <PhoneIcon size={14} />
                        {org.phone}
                      </a>
                    )}
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[#2c5f8d] hover:underline"
                      >
                        <GlobeIcon size={14} />
                        Сайт
                        <ExternalLinkIcon size={12} />
                      </a>
                    )}
                    {org.address && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-[#737373]">
                        <MapPinIcon size={14} />
                        {org.address}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {filteredOrganizations.filter((org) => !org.isMain).length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-[#737373] mb-2">
                По вашему запросу ничего не найдено
              </p>
              <p className="text-sm text-[#a3a3a3]">
                Попробуйте изменить поисковый запрос или фильтр
              </p>
            </div>
          )}

          {/* Bottom Info */}
          <Alert variant="info" className="mt-12">
            <strong>Не нашли нужную организацию?</strong> Позвоните на горячую линию 
            фонда «Защитники Отечества» <strong>8-800-200-34-11</strong> — вам помогут 
            найти нужный контакт.
          </Alert>
        </div>
      </main>

      <Footer />
    </div>
  );
}

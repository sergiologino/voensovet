import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import {
  ScaleIcon,
  SearchIcon,
  HomeIcon,
  HeartIcon,
  CarIcon,
  GraduationCapIcon,
  BanknoteIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';

interface BenefitCategory {
  id: string;
  icon: React.ElementType;
  title: string;
  benefits: {
    title: string;
    description: string;
    whoCanGet: string;
    howToGet: string;
  }[];
}

export function BenefitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['financial']);

  const categories: BenefitCategory[] = [
    {
      id: 'financial',
      icon: BanknoteIcon,
      title: 'Денежные выплаты и пособия',
      benefits: [
        {
          title: 'Ежемесячная денежная выплата (ЕДВ)',
          description: 'Ежемесячная выплата ветеранам боевых действий. Размер на 2024 год составляет около 3 900 рублей.',
          whoCanGet: 'Ветераны боевых действий с соответствующим удостоверением',
          howToGet: 'Подать заявление в ПФР через Госуслуги или лично в отделении',
        },
        {
          title: 'Единовременная выплата участникам СВО',
          description: 'Единовременная денежная выплата при заключении контракта и при получении ранения.',
          whoCanGet: 'Военнослужащие-контрактники, участники СВО',
          howToGet: 'Выплачивается автоматически через воинскую часть',
        },
        {
          title: 'Компенсация за санаторно-курортное лечение',
          description: 'Денежная компенсация в случае неиспользования путёвки на санаторно-курортное лечение.',
          whoCanGet: 'Ветераны боевых действий',
          howToGet: 'Заявление в ПФР до 1 октября текущего года',
        },
      ],
    },
    {
      id: 'housing',
      icon: HomeIcon,
      title: 'Жилищные льготы',
      benefits: [
        {
          title: 'Жилищный сертификат',
          description: 'Государственный жилищный сертификат на приобретение жилья для нуждающихся ветеранов.',
          whoCanGet: 'Ветераны боевых действий, признанные нуждающимися в улучшении жилищных условий',
          howToGet: 'Встать на учёт в администрации по месту жительства',
        },
        {
          title: 'Военная ипотека',
          description: 'Льготные условия ипотечного кредитования для военнослужащих.',
          whoCanGet: 'Военнослужащие-контрактники после 3 лет службы',
          howToGet: 'Регистрация в накопительно-ипотечной системе через командование',
        },
        {
          title: 'Компенсация расходов на ЖКХ',
          description: '50% компенсация расходов на оплату жилья и коммунальных услуг.',
          whoCanGet: 'Ветераны боевых действий и члены их семей',
          howToGet: 'Заявление в отделение социальной защиты или МФЦ',
        },
        {
          title: 'Первоочередное получение земельных участков',
          description: 'Право на первоочередное получение земельного участка для строительства жилого дома.',
          whoCanGet: 'Ветераны боевых действий',
          howToGet: 'Заявление в администрацию муниципального образования',
        },
      ],
    },
    {
      id: 'medical',
      icon: HeartIcon,
      title: 'Медицинские льготы',
      benefits: [
        {
          title: 'Бесплатное медицинское обслуживание',
          description: 'Обслуживание в военных госпиталях и медицинских учреждениях.',
          whoCanGet: 'Военнослужащие, ветераны боевых действий',
          howToGet: 'По удостоверению ветерана в медицинских учреждениях МО РФ',
        },
        {
          title: 'Бесплатные лекарства',
          description: 'Обеспечение бесплатными лекарственными препаратами по рецепту врача.',
          whoCanGet: 'Инвалиды боевых действий',
          howToGet: 'Рецепт от врача, получение в аптеках, работающих с льготниками',
        },
        {
          title: 'Санаторно-курортное лечение',
          description: 'Бесплатные путёвки в санатории МО РФ для лечения и реабилитации.',
          whoCanGet: 'Ветераны и инвалиды боевых действий',
          howToGet: 'Заявление в ПФР или военкомат, при наличии медицинских показаний',
        },
        {
          title: 'Протезирование',
          description: 'Бесплатное протезирование и обеспечение техническими средствами реабилитации.',
          whoCanGet: 'Инвалиды боевых действий',
          howToGet: 'Индивидуальная программа реабилитации через МСЭ',
        },
      ],
    },
    {
      id: 'transport',
      icon: CarIcon,
      title: 'Транспортные льготы',
      benefits: [
        {
          title: 'Бесплатный проезд в общественном транспорте',
          description: 'Бесплатный проезд в городском и пригородном общественном транспорте.',
          whoCanGet: 'Ветераны боевых действий (в зависимости от региона)',
          howToGet: 'По удостоверению ветерана или социальной карте',
        },
        {
          title: 'Бесплатный проезд к месту лечения',
          description: 'Оплата проезда к месту санаторно-курортного лечения и обратно.',
          whoCanGet: 'Инвалиды боевых действий',
          howToGet: 'Талоны на проезд в ПФР при получении путёвки',
        },
        {
          title: 'Льготы по транспортному налогу',
          description: 'Освобождение или скидка на транспортный налог (зависит от региона).',
          whoCanGet: 'Ветераны боевых действий',
          howToGet: 'Заявление в налоговую инспекцию',
        },
      ],
    },
    {
      id: 'education',
      icon: GraduationCapIcon,
      title: 'Образовательные льготы',
      benefits: [
        {
          title: 'Бесплатное образование',
          description: 'Право на бесплатное получение второго среднего профессионального образования.',
          whoCanGet: 'Ветераны боевых действий',
          howToGet: 'При поступлении в учебное заведение',
        },
        {
          title: 'Преимущественное зачисление в вузы',
          description: 'Приоритетное право зачисления при равных баллах с другими абитуриентами.',
          whoCanGet: 'Дети военнослужащих, погибших или ставших инвалидами',
          howToGet: 'Предоставить документы в приёмную комиссию',
        },
        {
          title: 'Подготовительные курсы',
          description: 'Бесплатное обучение на подготовительных отделениях вузов.',
          whoCanGet: 'Ветераны боевых действий, дети погибших военнослужащих',
          howToGet: 'Заявление в приёмную комиссию вуза',
        },
      ],
    },
    {
      id: 'work',
      icon: BriefcaseIcon,
      title: 'Трудовые льготы',
      benefits: [
        {
          title: 'Дополнительный отпуск',
          description: 'Право на дополнительный отпуск без сохранения заработной платы до 35 дней в году.',
          whoCanGet: 'Ветераны боевых действий',
          howToGet: 'Заявление работодателю',
        },
        {
          title: 'Приоритетное сохранение рабочего места',
          description: 'Преимущественное право оставления на работе при сокращении штата.',
          whoCanGet: 'Ветераны боевых действий',
          howToGet: 'Предоставить удостоверение работодателю',
        },
        {
          title: 'Профессиональная переподготовка',
          description: 'Бесплатная профессиональная переподготовка и повышение квалификации.',
          whoCanGet: 'Ветераны боевых действий, уволенные с военной службы',
          howToGet: 'Обратиться в службу занятости или фонд «Защитники Отечества»',
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      benefits: category.benefits.filter(
        (benefit) =>
          benefit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          benefit.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.benefits.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f0f4f8] rounded-lg px-4 py-2 mb-4">
              <ScaleIcon size={20} className="text-[#2c5f8d]" />
              <span className="text-sm font-medium text-[#2c5f8d]">
                Права и льготы
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Ваши права и льготы
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Полный справочник льгот, выплат и компенсаций для ветеранов боевых действий, 
              участников СВО и членов их семей. Узнайте, на что вы имеете право.
            </p>
          </div>

          {/* Info Alert */}
          <Alert variant="info" className="mb-8">
            <strong>Помощь в оформлении.</strong> Сотрудники фонда «Защитники Отечества» 
            помогут вам оформить все положенные льготы. Позвоните: <strong>8-800-200-34-11</strong>
          </Alert>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <SearchIcon
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#737373]"
                size={20}
              />
              <Input
                placeholder="Поиск по льготам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <div
                  key={category.id}
                  className="border-2 border-[#e5e5e5] rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-6 bg-[#fafafa] hover:bg-[#f0f4f8] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2c5f8d] rounded-xl flex items-center justify-center">
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="text-left">
                        <h2 className="text-lg font-semibold text-[#262626]">
                          {category.title}
                        </h2>
                        <p className="text-sm text-[#737373]">
                          {category.benefits.length} льгот{category.benefits.length > 4 ? '' : 'ы'}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="text-[#737373]" size={24} />
                    ) : (
                      <ChevronDownIcon className="text-[#737373]" size={24} />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {category.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="bg-white border-2 border-[#e5e5e5] rounded-xl p-6"
                        >
                          <h3 className="text-lg font-semibold text-[#262626] mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-[#525252] mb-4 leading-relaxed">
                            {benefit.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#f0f4f8] rounded-lg p-4">
                              <p className="text-xs font-medium text-[#2c5f8d] uppercase mb-1">
                                Кто может получить
                              </p>
                              <p className="text-sm text-[#525252]">
                                {benefit.whoCanGet}
                              </p>
                            </div>
                            <div className="bg-[#f0fdf4] rounded-lg p-4">
                              <p className="text-xs font-medium text-[#166534] uppercase mb-1">
                                Как получить
                              </p>
                              <p className="text-sm text-[#525252]">
                                {benefit.howToGet}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-[#737373] mb-2">
                По вашему запросу ничего не найдено
              </p>
              <p className="text-sm text-[#a3a3a3]">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-12 bg-[#f0f4f8] rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-[#262626] mb-4">
              Не нашли нужную информацию?
            </h3>
            <p className="text-sm text-[#525252] mb-6 max-w-2xl mx-auto">
              Законодательство постоянно обновляется, появляются новые льготы и выплаты. 
              Свяжитесь с нами для получения актуальной информации по вашей ситуации.
            </p>
            <a
              href="tel:88002003411"
              className="inline-flex items-center gap-2 bg-[#2c5f8d] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#1e4976] transition-colors"
            >
              Получить консультацию: 8-800-200-34-11
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

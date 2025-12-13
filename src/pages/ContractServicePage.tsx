import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ContractOfferCard } from '../components/contract/ContractOfferCard';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { SearchIcon, FilterIcon } from 'lucide-react';
export function ContractServicePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const contractOffers = [{
    id: 1,
    title: 'Военнослужащий по контракту (мотострелковые войска)',
    description: 'Служба в мотострелковых подразделениях. Обучение современным методам ведения боевых действий, работа с техникой и вооружением. Возможность карьерного роста.',
    location: 'Московская область',
    specialty: 'Мотострелковые войска',
    salary: 'от 200 000 ₽/мес',
    benefits: ['Бесплатное жилье или компенсация', 'Полное медицинское обслуживание', 'Оплачиваемый отпуск 45 дней', 'Льготная пенсия', 'Обучение за счет МО РФ', 'Страхование жизни и здоровья']
  }, {
    id: 2,
    title: 'Специалист связи и информационных технологий',
    description: 'Работа с современными системами связи и информационными технологиями. Обслуживание и настройка оборудования, обеспечение защищенной связи.',
    location: 'Санкт-Петербург',
    specialty: 'Войска связи',
    salary: 'от 180 000 ₽/мес',
    benefits: ['Современное оборудование', 'Повышение квалификации', 'Служебное жилье', 'Медицинская страховка', 'Социальный пакет', 'Карьерный рост']
  }, {
    id: 3,
    title: 'Водитель-механик бронетехники',
    description: 'Управление и техническое обслуживание бронированной техники. Полное обучение, получение специальных навыков и допусков.',
    location: 'Ростовская область',
    specialty: 'Танковые войска',
    salary: 'от 190 000 ₽/мес',
    benefits: ['Обучение вождению спецтехники', 'Получение военной специальности', 'Жилье в военном городке', 'Льготы для семьи', 'Бесплатное питание', 'Спортивные секции']
  }, {
    id: 4,
    title: 'Медицинский специалист военного госпиталя',
    description: 'Оказание медицинской помощи военнослужащим. Работа в современных госпиталях с новейшим оборудованием. Возможность повышения квалификации.',
    location: 'Краснодарский край',
    specialty: 'Военная медицина',
    salary: 'от 170 000 ₽/мес',
    benefits: ['Современное медоборудование', 'Повышение квалификации', 'Служебное жилье', 'Дополнительные выплаты', 'Льготы медработникам', 'Стабильный график']
  }, {
    id: 5,
    title: 'Инженер-сапер',
    description: 'Инженерное обеспечение войск, разминирование, строительство укреплений. Полное обучение специальности, работа с современным оборудованием.',
    location: 'Воронежская область',
    specialty: 'Инженерные войска',
    salary: 'от 210 000 ₽/мес',
    benefits: ['Специальное обучение', 'Повышенная оплата труда', 'Дополнительные выплаты', 'Служебное жилье', 'Расширенная страховка', 'Ранняя пенсия']
  }];
  const regions = ['all', 'Московская область', 'Санкт-Петербург', 'Ростовская область', 'Краснодарский край', 'Воронежская область'];
  const specialties = ['all', 'Мотострелковые войска', 'Войска связи', 'Танковые войска', 'Военная медицина', 'Инженерные войска'];
  const filteredOffers = contractOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) || offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || offer.location === selectedRegion;
    const matchesSpecialty = selectedSpecialty === 'all' || offer.specialty === selectedSpecialty;
    return matchesSearch && matchesRegion && matchesSpecialty;
  });
  return <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f0f4f8] rounded-lg px-4 py-2 mb-4">
              <span className="text-sm font-medium text-[#2c5f8d]">
                Контрактная служба
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Служба в ВС РФ по контракту
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Стабильная работа с достойной оплатой и социальными гарантиями.
              Выберите подходящую военную специальность и начните карьеру в
              Вооруженных Силах.
            </p>
          </div>

          {/* Info Alert */}
          <Alert variant="info" className="mb-8">
            <strong>Консультация по вопросам контрактной службы:</strong>{' '}
            8-800-100-77-07 (круглосуточно, бесплатно)
          </Alert>

          {/* Filters */}
          <div className="bg-[#fafafa] border-2 border-[#e5e5e5] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon size={20} className="text-[#737373]" />
              <h3 className="text-lg font-semibold text-[#262626]">Фильтры</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#737373]" size={20} />
                <Input placeholder="Поиск по названию..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12" />
              </div>

              <div>
                <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-[#d4d4d4] rounded-xl text-[#262626] text-base focus:outline-none focus:border-[#2c5f8d]">
                  <option value="all">Все регионы</option>
                  {regions.slice(1).map(region => <option key={region} value={region}>
                      {region}
                    </option>)}
                </select>
              </div>

              <div>
                <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-[#d4d4d4] rounded-xl text-[#262626] text-base focus:outline-none focus:border-[#2c5f8d]">
                  <option value="all">Все специальности</option>
                  {specialties.slice(1).map(specialty => <option key={specialty} value={specialty}>
                      {specialty}
                    </option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-[#737373]">
              Найдено предложений:{' '}
              <strong className="text-[#262626]">
                {filteredOffers.length}
              </strong>
            </p>
          </div>

          {/* Offers List */}
          <div className="space-y-6">
            {filteredOffers.map(offer => <ContractOfferCard key={offer.id} {...offer} onLearnMore={() => console.log('Learn more about', offer.title)} />)}
          </div>

          {filteredOffers.length === 0 && <div className="text-center py-12">
              <p className="text-lg text-[#737373] mb-4">
                По вашему запросу ничего не найдено
              </p>
              <p className="text-sm text-[#a3a3a3]">
                Попробуйте изменить параметры поиска или фильтры
              </p>
            </div>}

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f0f4f8] rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[#262626] mb-4">
                Требования к кандидатам
              </h3>
              <ul className="space-y-2 text-sm text-[#525252]">
                <li className="flex gap-2">
                  <span className="text-[#2c5f8d]">•</span>
                  <span>Гражданство Российской Федерации</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#2c5f8d]">•</span>
                  <span>
                    Возраст от 18 до 40 лет (для некоторых специальностей до 50
                    лет)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#2c5f8d]">•</span>
                  <span>Годность по состоянию здоровья</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#2c5f8d]">•</span>
                  <span>Образование не ниже среднего</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#f0fdf4] rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[#262626] mb-4">
                Как подать заявку
              </h3>
              <ol className="space-y-2 text-sm text-[#525252]">
                <li className="flex gap-2">
                  <span className="font-semibold text-[#2c5f8d]">1.</span>
                  <span>Позвоните на горячую линию или посетите военкомат</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#2c5f8d]">2.</span>
                  <span>Пройдите медицинское освидетельствование</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#2c5f8d]">3.</span>
                  <span>Подготовьте необходимые документы</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-[#2c5f8d]">4.</span>
                  <span>Подпишите контракт и начните службу</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>;
}
import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HelpCategory } from '../components/help/HelpCategory';
import { OrganizationCard } from '../components/help/OrganizationCard';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { AiAssistant } from '../components/ai/AiAssistant';
import { HeartIcon, StethoscopeIcon, UsersIcon, ScaleIcon, SearchIcon } from 'lucide-react';
export function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [{
    id: 'psychological',
    icon: HeartIcon,
    title: 'Психологическая помощь',
    description: 'Горячие линии, психологи, группы поддержки'
  }, {
    id: 'medical',
    icon: StethoscopeIcon,
    title: 'Медицинская помощь',
    description: 'Медицинские учреждения, реабилитация, лечение'
  }, {
    id: 'social',
    icon: UsersIcon,
    title: 'Социальная поддержка',
    description: 'Помощь с жильем, трудоустройством, адаптацией'
  }, {
    id: 'legal',
    icon: ScaleIcon,
    title: 'Юридическая помощь',
    description: 'Консультации юристов, защита прав'
  }];
  // Sample data for psychological help
  const psychologicalOrganizations = [{
    name: 'Горячая линия психологической помощи',
    description: 'Круглосуточная бесплатная поддержка для военнослужащих и их семей',
    phone: '8-800-2000-122',
    hours: 'Круглосуточно',
    isAvailableNow: true
  }, {
    name: 'Центр психологической реабилитации',
    description: 'Индивидуальные и групповые консультации, программы адаптации',
    phone: '8-495-123-45-67',
    website: 'https://example.com',
    hours: 'Пн-Пт 9:00-18:00',
    isAvailableNow: false
  }, {
    name: 'Служба экстренной психологической помощи',
    description: 'Кризисная помощь, работа с ПТСР, семейное консультирование',
    phone: '8-800-333-44-55',
    website: 'https://example.com',
    hours: 'Ежедневно 8:00-22:00',
    isAvailableNow: true
  }];
  return <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!selectedCategory ?
        // Category Selection View
        <>
              <div className="mb-12">
                <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
                  Мне нужна помощь
                </h1>
                <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
                  Выберите, в какой сфере вам нужна поддержка. Мы подберем для
                  вас подходящие организации и контакты.
                </p>
              </div>

              <Alert variant="info" className="mb-8">
                Все обращения конфиденциальны. Вы можете получить помощь
                анонимно.
              </Alert>

              {/* AI Assistant */}
              <div className="mb-12">
                <AiAssistant />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(category => <HelpCategory key={category.id} icon={category.icon} title={category.title} description={category.description} onClick={() => setSelectedCategory(category.id)} />)}
              </div>
            </> :
        // Organization List View (showing psychological help as example)
        <>
              <div className="mb-8">
                <button onClick={() => setSelectedCategory(null)} className="text-[#2c5f8d] hover:underline mb-4 text-sm">
                  ← Вернуться к категориям
                </button>

                <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
                  Психологическая помощь
                </h1>
                <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
                  Горячие линии, психологи и службы поддержки, которые помогут
                  вам прямо сейчас
                </p>
              </div>

              <Alert variant="success" title="Срочная помощь" className="mb-8">
                Если вам нужна немедленная помощь, позвоните по номеру{' '}
                <strong>8-800-2000-122</strong>. Линия работает круглосуточно и
                бесплатно.
              </Alert>

              <div className="mb-8">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#737373]" size={20} />
                  <Input placeholder="Поиск по названию или региону..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12" />
                </div>
              </div>

              <div className="space-y-6">
                {psychologicalOrganizations.map((org, index) => <OrganizationCard key={index} {...org} />)}
              </div>

              <div className="mt-12 bg-[#f0f4f8] rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-[#262626] mb-4">
                  Что можно сделать прямо сейчас
                </h3>
                <ul className="space-y-3 text-sm text-[#525252] leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-[#2c5f8d] font-bold">1.</span>
                    <span>
                      Найдите спокойное место, где вас никто не побеспокоит
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#2c5f8d] font-bold">2.</span>
                    <span>
                      Сделайте несколько глубоких вдохов: вдох на 4 счета, выдох
                      на 6
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#2c5f8d] font-bold">3.</span>
                    <span>
                      Позвоните на горячую линию — специалисты готовы выслушать
                      и помочь
                    </span>
                  </li>
                </ul>
              </div>
            </>}
        </div>
      </main>

      <Footer />
    </div>;
}
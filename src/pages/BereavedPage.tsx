import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import {
  HeartIcon,
  HomeIcon,
  PhoneIcon,
  FileTextIcon,
  UsersIcon,
  GraduationCapIcon,
  HandHeartIcon,
  ShieldIcon,
  ArrowRightIcon,
} from 'lucide-react';

export function BereavedPage() {
  const supportAreas = [
    {
      icon: HeartIcon,
      title: 'Психологическая помощь',
      description: 'Индивидуальные консультации, группы поддержки, помощь в переживании утраты',
      href: '#help',
    },
    {
      icon: FileTextIcon,
      title: 'Выплаты и компенсации',
      description: 'Страховые выплаты, пенсии по потере кормильца, единовременные пособия',
      href: '#benefits',
    },
    {
      icon: HomeIcon,
      title: 'Жилищная поддержка',
      description: 'Право на жильё, сохранение служебного жилья, жилищные сертификаты',
      href: '#benefits',
    },
    {
      icon: GraduationCapIcon,
      title: 'Поддержка детей',
      description: 'Бесплатное образование, путёвки, психологическая помощь детям',
      href: '#benefits',
    },
    {
      icon: UsersIcon,
      title: 'Социальная поддержка',
      description: 'Помощь в оформлении документов, сопровождение, юридические консультации',
      href: '#organizations',
    },
    {
      icon: HandHeartIcon,
      title: 'Увековечение памяти',
      description: 'Установка памятников, присвоение имён, создание мемориалов',
      href: '#organizations',
    },
  ];

  const payments = [
    {
      title: 'Единовременная выплата',
      amount: '5 000 000 ₽',
      description: 'Выплата семье погибшего военнослужащего',
    },
    {
      title: 'Страховая выплата',
      amount: '2 968 464 ₽',
      description: 'Обязательное государственное страхование',
    },
    {
      title: 'Пенсия по потере кормильца',
      amount: 'Ежемесячно',
      description: 'Назначается нетрудоспособным членам семьи',
    },
    {
      title: 'Региональные выплаты',
      amount: 'Зависит от региона',
      description: 'Дополнительная поддержка от субъекта РФ',
    },
  ];

  const contacts = [
    {
      name: 'Фонд «Защитники Отечества»',
      phone: '8-800-200-34-11',
      description: 'Координация всей помощи',
      isMain: true,
    },
    {
      name: 'Психологическая помощь',
      phone: '8-800-2000-122',
      description: 'Круглосуточная линия',
      isMain: false,
    },
    {
      name: 'Пенсионный фонд',
      phone: '8-800-600-44-44',
      description: 'Вопросы по пенсиям',
      isMain: false,
    },
  ];

  const documents = [
    'Свидетельство о смерти (гибели)',
    'Справка о прохождении военной службы',
    'Документы, подтверждающие родство',
    'Паспорт заявителя',
    'Реквизиты банковского счёта',
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f0f4f8] rounded-lg px-4 py-2 mb-4">
              <ShieldIcon size={20} className="text-[#2c5f8d]" />
              <span className="text-sm font-medium text-[#2c5f8d]">
                Поддержка семей погибших
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Мы рядом с вами
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Примите наши глубокие соболезнования. Государство и общество помнят о подвиге 
              вашего близкого и готовы оказать всестороннюю поддержку вашей семье.
            </p>
          </div>

          {/* Main Alert */}
          <Alert variant="info" className="mb-8">
            <strong>Персональный куратор.</strong> Каждой семье погибшего военнослужащего 
            назначается персональный куратор от фонда «Защитники Отечества», который поможет 
            с оформлением всех документов и выплат. Позвоните: <strong>8-800-200-34-11</strong>
          </Alert>

          {/* Support Areas */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Направления поддержки
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <Card
                    key={area.title}
                    variant="elevated"
                    hoverable
                    onClick={() => (window.location.href = area.href)}
                    className="cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-[#f0f4f8] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="text-[#2c5f8d]" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#262626] mb-2">
                      {area.title}
                    </h3>
                    <p className="text-sm text-[#737373] leading-relaxed">
                      {area.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Payments Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Положенные выплаты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {payments.map((payment) => (
                <div
                  key={payment.title}
                  className="bg-[#f0fdf4] border-2 border-[#86efac] rounded-2xl p-6"
                >
                  <div className="text-2xl font-bold text-[#166534] mb-2">
                    {payment.amount}
                  </div>
                  <h3 className="text-base font-semibold text-[#262626] mb-1">
                    {payment.title}
                  </h3>
                  <p className="text-sm text-[#737373]">{payment.description}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#737373] mt-4">
              * Суммы указаны на 2024 год и могут быть увеличены. Уточняйте актуальные размеры выплат.
            </p>
          </section>

          {/* Documents Section */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#fafafa] rounded-2xl p-8">
                <h2 className="text-xl font-bold text-[#262626] mb-6">
                  Необходимые документы
                </h2>
                <ul className="space-y-3">
                  {documents.map((doc, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#2c5f8d] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-sm text-[#525252]">{doc}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-[#737373] mt-6">
                  Куратор поможет собрать все необходимые документы и проконтролирует 
                  своевременность выплат.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#262626] mb-6">
                  Контакты для обращения
                </h2>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact.name}
                      className={`rounded-2xl p-6 ${
                        contact.isMain
                          ? 'bg-[#2c5f8d] text-white'
                          : 'bg-[#f0f4f8] border-2 border-transparent hover:border-[#2c5f8d]'
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <PhoneIcon
                          className={contact.isMain ? 'text-white' : 'text-[#2c5f8d]'}
                          size={24}
                        />
                        <a
                          href={`tel:${contact.phone.replace(/-/g, '')}`}
                          className={`text-xl font-bold hover:underline ${
                            contact.isMain ? 'text-white' : 'text-[#2c5f8d]'
                          }`}
                        >
                          {contact.phone}
                        </a>
                      </div>
                      <h3
                        className={`text-base font-semibold mb-1 ${
                          contact.isMain ? 'text-white' : 'text-[#262626]'
                        }`}
                      >
                        {contact.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          contact.isMain ? 'text-white/80' : 'text-[#737373]'
                        }`}
                      >
                        {contact.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-[#262626] rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Вечная память героям
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Память о подвиге вашего близкого будет жить в сердцах благодарных соотечественников. 
              Мы поможем увековечить его имя.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => (window.location.href = '#organizations')}
              >
                Узнать о программах памяти
                <ArrowRightIcon size={20} className="ml-2" />
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

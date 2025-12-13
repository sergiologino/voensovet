import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import {
  ShieldIcon,
  HeartIcon,
  HomeIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  PhoneIcon,
  FileTextIcon,
  UsersIcon,
  ArrowRightIcon,
} from 'lucide-react';

export function VeteranPage() {
  const supportAreas = [
    {
      icon: HeartIcon,
      title: 'Психологическая помощь',
      description: 'Бесплатная психологическая поддержка, работа с ПТСР, индивидуальные и групповые консультации',
      href: '#help',
    },
    {
      icon: FileTextIcon,
      title: 'Права и льготы',
      description: 'Полный перечень льгот, выплат и компенсаций для участников боевых действий',
      href: '#benefits',
    },
    {
      icon: HomeIcon,
      title: 'Жилищные вопросы',
      description: 'Программы обеспечения жильём, субсидии, военная ипотека',
      href: '#benefits',
    },
    {
      icon: BriefcaseIcon,
      title: 'Трудоустройство',
      description: 'Помощь в поиске работы, переподготовка, приоритетное трудоустройство',
      href: '#return',
    },
    {
      icon: GraduationCapIcon,
      title: 'Образование',
      description: 'Бесплатное обучение, повышение квалификации, получение новой профессии',
      href: '#return',
    },
    {
      icon: UsersIcon,
      title: 'Социальная адаптация',
      description: 'Программы адаптации к мирной жизни, сообщества ветеранов',
      href: '#return',
    },
  ];

  const urgentContacts = [
    {
      name: 'Горячая линия психологической помощи',
      phone: '8-800-2000-122',
      description: 'Круглосуточно, бесплатно',
    },
    {
      name: 'Фонд «Защитники Отечества»',
      phone: '8-800-200-34-11',
      description: 'Координация помощи ветеранам',
    },
    {
      name: 'Социальная защита',
      phone: '8-800-350-29-83',
      description: 'Консультации по льготам',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Получите статус ветерана',
      description: 'Обратитесь в военкомат для оформления удостоверения ветерана боевых действий',
    },
    {
      number: '02',
      title: 'Встаньте на учёт',
      description: 'Зарегистрируйтесь в фонде «Защитники Отечества» для получения координированной помощи',
    },
    {
      number: '03',
      title: 'Оформите льготы',
      description: 'Подайте заявления в МФЦ или через Госуслуги на все положенные выплаты и льготы',
    },
    {
      number: '04',
      title: 'Получите поддержку',
      description: 'Воспользуйтесь программами реабилитации, переподготовки и социальной адаптации',
    },
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
                Для участников боевых действий
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Добро пожаловать домой
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Вы выполнили свой долг перед Родиной. Теперь мы готовы помочь вам вернуться 
              к мирной жизни. Здесь вы найдёте информацию о ваших правах, льготах и программах поддержки.
            </p>
          </div>

          {/* Urgent Help Alert */}
          <Alert variant="info" className="mb-8">
            <strong>Нужна срочная помощь?</strong> Позвоните на горячую линию: 
            <a href="tel:88002000122" className="text-[#2c5f8d] font-bold ml-1 hover:underline">
              8-800-2000-122
            </a> (бесплатно, круглосуточно)
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

          {/* Steps Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              С чего начать
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <div className="text-6xl font-bold text-[#f0f4f8] mb-2">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-[#262626] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#737373] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Urgent Contacts */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Важные контакты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {urgentContacts.map((contact) => (
                <div
                  key={contact.name}
                  className="bg-[#f0f4f8] rounded-2xl p-6 border-2 border-transparent hover:border-[#2c5f8d] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <PhoneIcon className="text-[#2c5f8d]" size={24} />
                    <a
                      href={`tel:${contact.phone.replace(/-/g, '')}`}
                      className="text-xl font-bold text-[#2c5f8d] hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                  <h3 className="text-base font-semibold text-[#262626] mb-1">
                    {contact.name}
                  </h3>
                  <p className="text-sm text-[#737373]">{contact.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#2c5f8d] to-[#1e4976] rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Фонд «Защитники Отечества»
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Государственный фонд координирует всю помощь ветеранам и их семьям. 
              Зарегистрируйтесь, чтобы получить персонального куратора и доступ ко всем программам поддержки.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.open('https://фондзащитниковотечества.рф', '_blank')}
              >
                Перейти на сайт фонда
                <ArrowRightIcon size={20} className="ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => (window.location.href = '#organizations')}
              >
                Все организации
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}


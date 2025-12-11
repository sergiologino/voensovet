import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import {
  UsersIcon,
  HeartIcon,
  HomeIcon,
  GraduationCapIcon,
  PhoneIcon,
  BabyIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  HandHeartIcon,
} from 'lucide-react';

export function FamilyPage() {
  const supportAreas = [
    {
      icon: HeartIcon,
      title: 'Психологическая поддержка',
      description: 'Консультации психологов для супругов, детей и родителей военнослужащих',
      href: '#help',
    },
    {
      icon: HomeIcon,
      title: 'Жилищные льготы',
      description: 'Право на жильё, субсидии, улучшение жилищных условий для семей военнослужащих',
      href: '#benefits',
    },
    {
      icon: GraduationCapIcon,
      title: 'Образование детей',
      description: 'Льготы при поступлении, бесплатное питание, приоритетное зачисление',
      href: '#benefits',
    },
    {
      icon: BabyIcon,
      title: 'Поддержка детей',
      description: 'Путёвки в лагеря, кружки и секции, психологическая помощь детям',
      href: '#help',
    },
    {
      icon: BriefcaseIcon,
      title: 'Трудоустройство супругов',
      description: 'Помощь в поиске работы, переобучение, приоритетное трудоустройство',
      href: '#return',
    },
    {
      icon: HandHeartIcon,
      title: 'Социальные выплаты',
      description: 'Денежные пособия, компенсации, материальная помощь семьям',
      href: '#benefits',
    },
  ];

  const faqItems = [
    {
      question: 'Какие льготы положены семьям военнослужащих?',
      answer: 'Семьи военнослужащих имеют право на: льготы по оплате ЖКХ, бесплатное медицинское обслуживание, льготы на проезд, приоритетное зачисление детей в сады и школы, санаторно-курортное лечение.',
    },
    {
      question: 'Как получить психологическую помощь?',
      answer: 'Вы можете обратиться на горячую линию 8-800-2000-122 или записаться на приём в Центр психологической помощи. Все консультации бесплатны и конфиденциальны.',
    },
    {
      question: 'Куда обращаться за материальной помощью?',
      answer: 'Обратитесь в фонд «Защитники Отечества», МФЦ или отделение социальной защиты по месту жительства. Вам помогут оформить все положенные выплаты.',
    },
    {
      question: 'Есть ли поддержка для детей военнослужащих?',
      answer: 'Да. Дети имеют право на бесплатное питание в школе, путёвки в оздоровительные лагеря, льготы при поступлении в вузы, психологическую поддержку.',
    },
  ];

  const contacts = [
    {
      name: 'Линия поддержки семей',
      phone: '8-800-200-34-11',
      description: 'Фонд «Защитники Отечества»',
    },
    {
      name: 'Психологическая помощь',
      phone: '8-800-2000-122',
      description: 'Круглосуточно',
    },
    {
      name: 'Социальная защита',
      phone: '8-800-350-29-83',
      description: 'Консультации по льготам',
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
              <UsersIcon size={20} className="text-[#2c5f8d]" />
              <span className="text-sm font-medium text-[#2c5f8d]">
                Для членов семьи военнослужащих
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Поддержка для вашей семьи
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Семьи военнослужащих — участников СВО имеют особые права и льготы. 
              Мы поможем вам разобраться в них и получить всю положенную поддержку.
            </p>
          </div>

          {/* Info Alert */}
          <Alert variant="success" className="mb-8">
            <strong>Важно:</strong> Все члены семьи военнослужащего (супруг/супруга, дети, родители) 
            имеют право на государственную поддержку. Обратитесь за консультацией — это бесплатно.
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

          {/* Contacts */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Контакты для обращения
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contacts.map((contact) => (
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

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Частые вопросы
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#fafafa] border-2 border-[#e5e5e5] rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-[#262626] mb-2">
                    {item.question}
                  </h3>
                  <p className="text-sm text-[#525252] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#5a7f5a] to-[#4a6b4a] rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Нужна помощь прямо сейчас?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Позвоните на горячую линию — специалисты ответят на все вопросы 
              и помогут получить необходимую поддержку.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = 'tel:88002003411'}
              >
                <PhoneIcon size={20} className="mr-2" />
                8-800-200-34-11
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => (window.location.href = '#help')}
              >
                Все виды помощи
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


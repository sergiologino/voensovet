import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import {
  HeartPulseIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  UsersIcon,
  HomeIcon,
  SparklesIcon,
  ArrowRightIcon,
  PhoneIcon,
  CheckCircleIcon,
} from 'lucide-react';

export function ReturnToLifePage() {
  const programs = [
    {
      icon: HeartPulseIcon,
      title: 'Медицинская реабилитация',
      description:
        'Комплексное восстановление здоровья после ранений. Протезирование, физиотерапия, санаторное лечение.',
      features: [
        'Бесплатное лечение в госпиталях',
        'Современное протезирование',
        'Санаторно-курортное лечение',
        'Длительная реабилитация',
      ],
      href: '#help',
    },
    {
      icon: HeartPulseIcon,
      title: 'Психологическая помощь',
      description:
        'Профессиональная поддержка в адаптации к мирной жизни. Работа с ПТСР, индивидуальные и групповые консультации.',
      features: [
        'Горячая линия 24/7',
        'Работа с ПТСР',
        'Семейные консультации',
        'Группы поддержки',
      ],
      href: '#help',
    },
    {
      icon: BriefcaseIcon,
      title: 'Трудоустройство',
      description:
        'Помощь в поиске работы и построении карьеры на гражданке. Приоритетное трудоустройство, вакансии от партнёров.',
      features: [
        'База вакансий для ветеранов',
        'Карьерные консультации',
        'Помощь с резюме',
        'Партнёрские программы',
      ],
      href: '#',
    },
    {
      icon: GraduationCapIcon,
      title: 'Образование и переподготовка',
      description:
        'Бесплатное обучение новым профессиям. Повышение квалификации, получение гражданских специальностей.',
      features: [
        'Бесплатное обучение',
        'Востребованные профессии',
        'Онлайн-курсы',
        'Стипендии на обучение',
      ],
      href: '#',
    },
    {
      icon: UsersIcon,
      title: 'Сообщество ветеранов',
      description:
        'Присоединяйтесь к сообществу единомышленников. Общение, мероприятия, взаимопомощь.',
      features: [
        'Клубы по интересам',
        'Совместные мероприятия',
        'Взаимоподдержка',
        'Наставничество',
      ],
      href: '#organizations',
    },
    {
      icon: HomeIcon,
      title: 'Жилищные программы',
      description:
        'Помощь в решении жилищного вопроса. Военная ипотека, жилищные сертификаты, субсидии.',
      features: [
        'Жилищные сертификаты',
        'Военная ипотека',
        'Субсидии на жильё',
        'Консультации по программам',
      ],
      href: '#benefits',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Оцените своё состояние',
      description:
        'Обратите внимание на своё физическое и психологическое здоровье. Не стесняйтесь обращаться за помощью.',
    },
    {
      number: '2',
      title: 'Обратитесь за поддержкой',
      description:
        'Свяжитесь с фондом «Защитники Отечества» или позвоните на горячую линию. Вам назначат куратора.',
    },
    {
      number: '3',
      title: 'Составьте план',
      description:
        'Вместе с куратором определите приоритеты: здоровье, работа, обучение, жильё.',
    },
    {
      number: '4',
      title: 'Действуйте поэтапно',
      description:
        'Не пытайтесь решить всё сразу. Двигайтесь шаг за шагом, используя доступные программы поддержки.',
    },
  ];

  const successStories = [
    {
      quote:
        'После ранения думал, что жизнь кончена. Но благодаря реабилитации и поддержке снова встал на ноги. Сейчас работаю инструктором.',
      name: 'Алексей, 34 года',
      location: 'Московская область',
    },
    {
      quote:
        'Прошёл переобучение на IT-специалиста. Теперь работаю удалённо, могу больше времени проводить с семьёй.',
      name: 'Дмитрий, 29 лет',
      location: 'Краснодарский край',
    },
    {
      quote:
        'Группы поддержки очень помогли. Понял, что не один такой, и что можно жить полноценной жизнью.',
      name: 'Сергей, 38 лет',
      location: 'Санкт-Петербург',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#f0fdf4] rounded-lg px-4 py-2 mb-4">
              <SparklesIcon size={20} className="text-[#166534]" />
              <span className="text-sm font-medium text-[#166534]">
                Программы адаптации
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Возвращение к жизни
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Комплексные программы помощи в адаптации к мирной жизни. Медицинская реабилитация, 
              психологическая поддержка, обучение и трудоустройство — всё для вашего 
              успешного возвращения.
            </p>
          </div>

          {/* Info Alert */}
          <Alert variant="success" className="mb-12">
            <strong>Вы не одиноки.</strong> Тысячи ветеранов уже прошли путь адаптации 
            и живут полноценной жизнью. Мы поможем и вам.
          </Alert>

          {/* Programs Grid */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Программы поддержки
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => {
                const Icon = program.icon;
                return (
                  <Card
                    key={program.title}
                    variant="elevated"
                    hoverable
                    onClick={() => (window.location.href = program.href)}
                    className="cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-[#f0fdf4] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="text-[#166534]" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#262626] mb-2">
                      {program.title}
                    </h3>
                    <p className="text-sm text-[#525252] mb-4 leading-relaxed">
                      {program.description}
                    </p>
                    <ul className="space-y-2">
                      {program.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-[#737373]"
                        >
                          <CheckCircleIcon size={14} className="text-[#166534]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Steps Section */}
          <section className="mb-16 bg-[#f0f4f8] rounded-3xl p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8 text-center">
              С чего начать адаптацию
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 bg-[#2c5f8d] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#262626] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#525252] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Success Stories */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#262626] mb-8">
              Истории успеха
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6"
                >
                  <div className="text-4xl text-[#2c5f8d] mb-4">"</div>
                  <p className="text-sm text-[#525252] leading-relaxed mb-4">
                    {story.quote}
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-[#262626]">{story.name}</p>
                    <p className="text-xs text-[#737373]">{story.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#5a7f5a] to-[#4a6b4a] rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Начните путь к новой жизни сегодня
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Позвоните на горячую линию или запишитесь на консультацию. 
              Первый шаг — самый важный.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => (window.location.href = 'tel:88002003411')}
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
                Записаться на консультацию
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


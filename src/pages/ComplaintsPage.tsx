import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  AlertCircleIcon,
  ShieldIcon,
  FileTextIcon,
  PhoneIcon,
  MailIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  SendIcon,
} from 'lucide-react';

export function ComplaintsPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    description: '',
    anonymous: false,
  });

  const categories = [
    {
      id: 'benefits',
      title: 'Проблемы с получением льгот',
      description: 'Отказ в оформлении, задержка выплат, неправильный расчёт',
    },
    {
      id: 'medical',
      title: 'Медицинское обслуживание',
      description: 'Отказ в лечении, очереди, качество медпомощи',
    },
    {
      id: 'housing',
      title: 'Жилищные вопросы',
      description: 'Проблемы с жильём, отказ в постановке на учёт',
    },
    {
      id: 'work',
      title: 'Трудовые права',
      description: 'Дискриминация, незаконное увольнение, отказ в трудоустройстве',
    },
    {
      id: 'military',
      title: 'Нарушения в воинской части',
      description: 'Проблемы со снабжением, командованием, условиями службы',
    },
    {
      id: 'other',
      title: 'Другое',
      description: 'Иные нарушения прав ветеранов и их семей',
    },
  ];

  const contacts = [
    {
      icon: PhoneIcon,
      title: 'Горячая линия',
      value: '8-800-200-34-11',
      description: 'Фонд «Защитники Отечества»',
      href: 'tel:88002003411',
    },
    {
      icon: MailIcon,
      title: 'Электронная почта',
      value: 'help@fondzo.ru',
      description: 'Ответ в течение 3 рабочих дней',
      href: 'mailto:help@fondzo.ru',
    },
    {
      icon: BuildingIcon,
      title: 'Личный приём',
      value: 'Региональные филиалы',
      description: 'Во всех регионах России',
      href: '#organizations',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // В реальном приложении здесь была бы отправка данных на сервер
    alert('Ваше обращение отправлено. Мы свяжемся с вами в ближайшее время.');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-[#fef3c7] rounded-lg px-4 py-2 mb-4">
              <AlertCircleIcon size={20} className="text-[#b45309]" />
              <span className="text-sm font-medium text-[#b45309]">
                Защита прав
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-4">
              Сообщить о нарушении прав
            </h1>
            <p className="text-lg text-[#525252] leading-relaxed max-w-3xl">
              Если вы столкнулись с нарушением ваших прав как ветерана или члена семьи 
              военнослужащего, мы поможем разобраться в ситуации и защитить ваши интересы.
            </p>
          </div>

          {/* Privacy Alert */}
          <Alert variant="success" className="mb-8">
            <div className="flex items-center gap-2">
              <ShieldIcon size={18} />
              <strong>Конфиденциальность гарантирована.</strong>
            </div>
            Все обращения обрабатываются конфиденциально. Вы можете оставить жалобу анонимно.
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#fafafa] border-2 border-[#e5e5e5] rounded-2xl p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-[#262626] mb-6">
                  Форма обращения
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#262626] mb-3">
                      Категория обращения *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <label
                          key={cat.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                            formData.category === cat.id
                              ? 'border-[#2c5f8d] bg-[#f0f4f8]'
                              : 'border-[#e5e5e5] hover:border-[#d4d4d4]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.id}
                            checked={formData.category === cat.id}
                            onChange={handleChange}
                            className="mt-1"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#262626]">
                              {cat.title}
                            </p>
                            <p className="text-xs text-[#737373]">{cat.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#262626] mb-2">
                      Опишите ситуацию *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      required
                      placeholder="Подробно опишите, что произошло, когда и где. Укажите имена должностных лиц, если известны."
                      className="w-full px-4 py-3 border-2 border-[#d4d4d4] rounded-xl text-base text-[#262626] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#2c5f8d] resize-none"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        name="anonymous"
                        checked={formData.anonymous}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-[#d4d4d4]"
                      />
                      <label htmlFor="anonymous" className="text-sm text-[#525252]">
                        Хочу оставить обращение анонимно
                      </label>
                    </div>

                    {!formData.anonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#262626] mb-2">
                            Ваше имя
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Иван Иванов"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#262626] mb-2">
                            Телефон для связи
                          </label>
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+7 (999) 123-45-67"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-[#262626] mb-2">
                            Email
                          </label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@mail.ru"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <SendIcon size={20} className="mr-2" />
                    Отправить обращение
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* How it works */}
              <Card variant="elevated">
                <h3 className="text-lg font-semibold text-[#262626] mb-4">
                  Как это работает
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#f0f4f8] rounded-full flex items-center justify-center flex-shrink-0">
                      <FileTextIcon size={16} className="text-[#2c5f8d]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#262626]">
                        Заполните форму
                      </p>
                      <p className="text-xs text-[#737373]">
                        Опишите ситуацию максимально подробно
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#f0f4f8] rounded-full flex items-center justify-center flex-shrink-0">
                      <ClockIcon size={16} className="text-[#2c5f8d]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#262626]">
                        Ожидайте ответа
                      </p>
                      <p className="text-xs text-[#737373]">
                        Мы рассмотрим обращение в течение 3 дней
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#f0f4f8] rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon size={16} className="text-[#2c5f8d]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#262626]">
                        Получите помощь
                      </p>
                      <p className="text-xs text-[#737373]">
                        Специалист поможет решить проблему
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-[#f0fdf4] rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon size={16} className="text-[#166534]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#262626]">
                        Контроль результата
                      </p>
                      <p className="text-xs text-[#737373]">
                        Мы проследим за исполнением
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contacts */}
              <Card variant="elevated">
                <h3 className="text-lg font-semibold text-[#262626] mb-4">
                  Другие способы обращения
                </h3>
                <div className="space-y-4">
                  {contacts.map((contact) => {
                    const Icon = contact.icon;
                    return (
                      <a
                        key={contact.title}
                        href={contact.href}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f0f4f8] transition-colors"
                      >
                        <Icon size={20} className="text-[#2c5f8d] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#2c5f8d]">
                            {contact.value}
                          </p>
                          <p className="text-xs text-[#737373]">
                            {contact.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

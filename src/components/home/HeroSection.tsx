import React from 'react';
import { Button } from '../ui/Button';
import { PhoneIcon } from 'lucide-react';

export function HeroSection() {
  const userTypes = [
    {
      title: 'Я вернулся(лась) из зоны боевых действий',
      description: 'Помощь в адаптации, права и льготы для военнослужащих',
      href: '#veteran',
    },
    {
      title: 'Я член семьи',
      description: 'Поддержка для родственников военнослужащих',
      href: '#family',
    },
    {
      title: 'Я из семьи погибшего',
      description: 'Помощь и поддержка семьям погибших',
      href: '#bereaved',
    },
  ];
  return <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: 'url(https://cdn.magicpatterns.com/uploads/5WvsY76LgP8LRhVbL4LYzf/banner.png)',
      filter: 'blur(2px)',
      transform: 'scale(1.1)'
    }} />

      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/45" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Message */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#262626] mb-6 leading-tight">
            Здесь вам помогут и подскажут
          </h2>
          <p className="text-lg lg:text-xl text-[#525252] max-w-3xl mx-auto leading-relaxed">
            Это место, где вы можете получить поддержку, узнать о своих правах и
            найти нужные контакты. Все обращения конфиденциальны.
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {userTypes.map(type => <a key={type.title} href={type.href} className="bg-white/95 backdrop-blur-sm border-2 border-[#d4d4d4] rounded-2xl p-8 hover:border-[#2c5f8d] hover:shadow-lg transition-all group">
              <h3 className="text-lg font-semibold text-[#262626] mb-3 group-hover:text-[#2c5f8d]">
                {type.title}
              </h3>
              <p className="text-sm text-[#737373] leading-relaxed">
                {type.description}
              </p>
            </a>)}
        </div>

        {/* Urgent Help CTA */}
        <div className="bg-[#5a7f5a] rounded-2xl p-8 lg:p-12 text-center shadow-lg">
          <PhoneIcon className="mx-auto mb-4 text-white" size={48} />
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Нужна срочная помощь?
          </h3>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Если вам нужна немедленная поддержка, мы поможем найти специалистов
            и организации, которые работают прямо сейчас
          </p>
          <Button variant="secondary" size="lg" onClick={() => window.location.href = '#help'}>
            Получить помощь сейчас
          </Button>
        </div>
      </div>
    </section>;
}
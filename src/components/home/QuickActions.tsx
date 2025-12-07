import React from 'react';
import { Card } from '../ui/Card';
import { ScaleIcon, HeartIcon, AlertCircleIcon, BuildingIcon } from 'lucide-react';
export function QuickActions() {
  const actions = [{
    icon: ScaleIcon,
    title: 'Узнать свои права и льготы',
    description: 'Полный список прав, льгот и компенсаций',
    href: '#benefits'
  }, {
    icon: HeartIcon,
    title: 'Найти психологическую поддержку',
    description: 'Горячие линии и специалисты',
    href: '#psychological'
  }, {
    icon: AlertCircleIcon,
    title: 'Оставить жалобу о нарушении прав',
    description: 'Анонимно и конфиденциально',
    href: '#complaint'
  }, {
    icon: BuildingIcon,
    title: 'Посмотреть контакты организаций',
    description: 'Каталог государственных и общественных организаций',
    href: '#organizations'
  }];
  return <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#262626] mb-12 text-center">
          Быстрые действия
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map(action => {
          const Icon = action.icon;
          return <Card key={action.title} variant="elevated" hoverable onClick={() => window.location.href = action.href} className="text-center">
                <div className="w-16 h-16 bg-[#f0f4f8] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-[#2c5f8d]" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-[#262626] mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-[#737373] leading-relaxed">
                  {action.description}
                </p>
              </Card>;
        })}
        </div>
      </div>
    </section>;
}
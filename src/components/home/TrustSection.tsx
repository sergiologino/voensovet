import React from 'react';
import { Alert } from '../ui/Alert';
import { ShieldCheckIcon, LockIcon, UsersIcon } from 'lucide-react';
export function TrustSection() {
  return <section className="py-16 lg:py-20 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#262626] mb-12 text-center">
          Ваша безопасность важна для нас
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6 text-center">
            <ShieldCheckIcon className="mx-auto mb-4 text-[#2c5f8d]" size={40} />
            <h3 className="text-lg font-semibold text-[#262626] mb-2">
              Конфиденциальность
            </h3>
            <p className="text-sm text-[#737373] leading-relaxed">
              Все ваши обращения обрабатываются конфиденциально
            </p>
          </div>

          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6 text-center">
            <LockIcon className="mx-auto mb-4 text-[#2c5f8d]" size={40} />
            <h3 className="text-lg font-semibold text-[#262626] mb-2">
              Защита данных
            </h3>
            <p className="text-sm text-[#737373] leading-relaxed">
              Ваши личные данные надежно защищены
            </p>
          </div>

          <div className="bg-white border-2 border-[#e5e5e5] rounded-2xl p-6 text-center">
            <UsersIcon className="mx-auto mb-4 text-[#2c5f8d]" size={40} />
            <h3 className="text-lg font-semibold text-[#262626] mb-2">
              Профессионалы
            </h3>
            <p className="text-sm text-[#737373] leading-relaxed">
              С вами работают квалифицированные специалисты
            </p>
          </div>
        </div>

        <Alert variant="info" title="О сервисе">
          Портал создан при поддержке государственных органов и общественных
          организаций для помощи военнослужащим, ветеранам и их семьям. Все
          услуги предоставляются бесплатно.
        </Alert>
      </div>
    </section>;
}
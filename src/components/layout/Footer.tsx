import React from 'react';
export function Footer() {
  return <footer className="bg-[#fafafa] border-t-2 border-[#e5e5e5] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-[#262626] mb-4">
              О сервисе
            </h3>
            <p className="text-sm text-[#737373] leading-relaxed">
              Портал создан для поддержки военнослужащих, ветеранов и их семей.
              Все обращения обрабатываются конфиденциально.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#262626] mb-4">
              Документы
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-[#737373] hover:text-[#2c5f8d]">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#737373] hover:text-[#2c5f8d]">
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#737373] hover:text-[#2c5f8d]">
                  Правила использования
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#262626] mb-4">
              Контакты
            </h3>
            <p className="text-sm text-[#737373] leading-relaxed">
              Техническая поддержка:
              <br />
              <a href="mailto:support@portal.ru" className="text-[#2c5f8d] hover:underline">
                support@portal.ru
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t-2 border-[#e5e5e5]">
          <p className="text-xs text-[#a3a3a3] text-center font-mono">
            © 2024 Портал Поддержки. Все обращения конфиденциальны.
          </p>
        </div>
      </div>
    </footer>;
}
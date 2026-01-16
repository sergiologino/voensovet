import React from 'react';
import { SEO } from '../components/seo/SEO';

function goToHomeAndOpenBot(prefill?: string) {
  window.localStorage.setItem('vs_entry_seen', '1');
  window.sessionStorage.setItem('vs_ai_autofocus', '1');
  if (prefill && prefill.trim()) {
    window.sessionStorage.setItem('vs_ai_prefill', prefill.trim());
  }
  window.location.hash = '#home';
}

export function EntryLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f8fb] via-[#f3f6fa] to-white text-[#262626]">
      <SEO
        title="Voensovet — помощник и проводник"
        description="Помогаем разобраться после службы и в сложных ситуациях. Для военных, участников СВО и их семей. Бесплатно."
        canonical="https://voensovet.ru#welcome"
      />

      {/* Hero: first screen, no scroll requirement */}
      <section className="min-h-screen flex items-center">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/voenkot_bot.png"
              alt="ВоенКот"
              className="h-12 w-12 object-contain"
            />
            <div className="text-sm text-[#525252]">
              Voensovet.ru
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#171717]">
            Помогаем разобраться после службы и в сложных ситуациях
          </h1>

          <h2 className="mt-4 text-lg sm:text-xl text-[#404040] max-w-3xl leading-relaxed">
            Voensovet — твой помощник и проводник
            <br />
            Права, выплаты, здоровье, работа, планы на будущее —
            <br />
            понятным языком и без беготни по кабинетам
          </h2>

          <p className="mt-4 text-sm text-[#525252]">
            Для военных, участников СВО и их семей. Бесплатно.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => goToHomeAndOpenBot()}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold bg-[#16a34a] text-white shadow-lg shadow-green-700/10 hover:bg-[#15803d] focus:outline-none focus:ring-4 focus:ring-green-400/30 transition-colors"
            >
              Поговорить с Воен Котом
            </button>

            {/* Not a secondary CTA button: subtle text-link */}
            <div className="mt-4 text-sm text-[#525252]">
              <button
                type="button"
                onClick={() => {
                  window.localStorage.setItem('vs_entry_seen', '1');
                  window.location.hash = '#home';
                }}
                className="underline underline-offset-4 hover:text-[#262626] transition-colors"
              >
                Перейти дальше на сайт
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2.2 Recognition */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#171717]">
            Сюда приходят с разными вопросами
          </h3>
          <div className="mt-10 space-y-8 text-lg text-[#404040] leading-relaxed">
            <p>Кто-то только вернулся и хочет понять, что делать дальше</p>
            <p>Кто-то застрял в бумагах, льготах или выплатах</p>
            <p>Кто-то думает о работе, обучении или своём деле</p>
            <p>А кому-то сейчас действительно непросто, и нужна поддержка</p>
            <p className="pt-4 font-semibold text-[#262626]">
              Все эти вопросы нормальны.
              <br />
              И с ними не обязательно разбираться в одиночку.
            </p>
          </div>
        </div>
      </section>

      {/* 2.3 What this place is */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#171717]">
            Voensovet — это не справочник
          </h3>
          <div className="mt-8 text-lg text-[#404040] leading-relaxed space-y-4">
            <p>Мы не просто собираем информацию.</p>
            <p>
              Мы помогаем понять, что относится именно к вам,
              <br />
              и с чего лучше начать.
            </p>
            <p>Иногда это быстрый ответ.</p>
            <p>Иногда — путь из нескольких шагов.</p>
            <p className="font-medium text-[#262626]">Но вы не остаетесь с этим одни.</p>
          </div>
        </div>
      </section>

      {/* 2.4 Who we help */}
      <section className="py-16 sm:py-20 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#171717]">
            Кому мы помогаем
          </h3>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => goToHomeAndOpenBot('Я участник СВО. Подскажи, с чего начать после службы и какие шаги сейчас важнее всего?')}
              className="text-left rounded-2xl border-2 border-[#e5e5e5] bg-white p-6 hover:border-[#cbd5e1] hover:shadow-md transition-all"
            >
              <div className="text-lg font-bold text-[#171717]">Участникам СВО</div>
              <div className="mt-2 text-sm text-[#525252]">
                Когда служба закончилась, а вопросы только начались
              </div>
            </button>

            <button
              type="button"
              onClick={() => goToHomeAndOpenBot('Я из семьи военнослужащего. Нужна помощь: выплаты, документы, права — с чего начать и какие варианты есть?')}
              className="text-left rounded-2xl border-2 border-[#e5e5e5] bg-white p-6 hover:border-[#cbd5e1] hover:shadow-md transition-all"
            >
              <div className="text-lg font-bold text-[#171717]">Семьям, которые ждут</div>
              <div className="mt-2 text-sm text-[#525252]">
                Когда тревога и неопределённость каждый день
              </div>
            </button>

            <button
              type="button"
              onClick={() => goToHomeAndOpenBot('Мы потеряли близкого. Подскажите, какие документы и выплаты обычно нужно оформить и в каком порядке?')}
              className="text-left rounded-2xl border-2 border-[#e5e5e5] bg-white p-6 hover:border-[#cbd5e1] hover:shadow-md transition-all"
            >
              <div className="text-lg font-bold text-[#171717]">Семьям погибших</div>
              <div className="mt-2 text-sm text-[#525252]">
                Когда боль и документы навалились одновременно
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 2.5 Final */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl sm:text-2xl font-semibold text-[#171717]">
            Ты можешь начать с разговора.
          </p>
          <p className="mt-3 text-lg text-[#404040]">
            Остальное мы поможем разложить по шагам.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => goToHomeAndOpenBot()}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold bg-[#16a34a] text-white shadow-lg shadow-green-700/10 hover:bg-[#15803d] focus:outline-none focus:ring-4 focus:ring-green-400/30 transition-colors"
            >
              Поговорить с Воен Котом
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


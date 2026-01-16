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
    <div className="min-h-screen text-[#262626] bg-[#f7f8fb] relative overflow-hidden">
      <SEO
        title="Voensovet — помощник и проводник"
        description="Помогаем разобраться после службы и в сложных ситуациях. Для военных, участников СВО и их семей. Бесплатно."
        canonical="https://voensovet.ru#welcome"
      />

      {/* Soft "morning" background: calm, warm, strict */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_65%)]" />
        <div className="absolute -top-32 -right-24 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_65%)]" />
        <div className="absolute top-[28%] left-[12%] h-[520px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.10),transparent_70%)] blur-[2px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,248,251,0.9),rgba(247,248,251,0.55),rgba(255,255,255,0.95))]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.18) 0.5px, transparent 0.5px)', backgroundSize: '18px 18px' }} />
      </div>

      {/* Hero: first screen, no scroll requirement */}
      <section className="min-h-screen flex items-center relative">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-10">
            <img
              src="/voenkot_bot.png"
              alt="ВоенКот"
              className="h-12 w-12 object-contain drop-shadow-sm"
            />
            <div className="text-sm font-medium text-[#404040]">
              Voensovet.ru
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Copy */}
            <div className="lg:col-span-7">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-[1.05]">
                Помогаем разобраться после службы и в сложных ситуациях
              </h1>

              <h2 className="mt-6 text-xl sm:text-2xl text-[#334155] max-w-3xl leading-relaxed">
                Voensovet — твой помощник и проводник
                <br />
                Права, выплаты, здоровье, работа, планы на будущее —
                <br />
                понятным языком и без беготни по кабинетам
              </h2>

              <p className="mt-5 text-base text-[#475569]">
                Для военных, участников СВО и их семей. Бесплатно.
              </p>

              <div className="mt-9">
                <button
                  type="button"
                  onClick={() => goToHomeAndOpenBot()}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl px-7 py-4 text-lg font-semibold bg-[#16a34a] text-white shadow-xl shadow-green-700/15 hover:bg-[#15803d] focus:outline-none focus:ring-4 focus:ring-green-400/30 transition-colors"
                >
                  Поговорить с Воен Котом
                </button>

                {/* Not a secondary CTA button: subtle text-link */}
                <div className="mt-5 text-sm text-[#64748b]">
                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.setItem('vs_entry_seen', '1');
                      window.location.hash = '#home';
                    }}
                    className="underline underline-offset-4 hover:text-[#334155] transition-colors"
                  >
                    Перейти дальше на сайт
                  </button>
                </div>
              </div>
            </div>

            {/* Visual anchor / VoenKot card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-2xl shadow-slate-900/10 overflow-hidden">
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#f0fdf4] flex items-center justify-center border border-[#dcfce7]">
                      <img
                        src="/voenkot_bot.png"
                        alt="ВоенКот"
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#0f172a]">ВоенКот</div>
                      <div className="text-sm text-[#475569]">Начнём с вопроса — дальше разложим по шагам</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-sm font-medium text-[#334155]">О чём можно спросить</div>
                      <div className="mt-2 text-sm text-[#64748b] leading-relaxed">
                        Права и выплаты • документы • здоровье • работа • обучение • поддержка
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold text-[#334155]">Понятно</div>
                        <div className="mt-1 text-xs text-[#64748b]">без канцелярита</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold text-[#334155]">Бережно</div>
                        <div className="mt-1 text-xs text-[#64748b]">без давления</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-7 pb-6">
                  <div className="rounded-2xl bg-[#0f172a] text-white px-4 py-3 text-sm">
                    «С чего начать?» — это нормальный вопрос. Давайте начнём с него.
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-[#64748b]">
                Спокойно. Уверенно. Строго, но тепло.
              </div>
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


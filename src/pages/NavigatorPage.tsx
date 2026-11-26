import { useEffect, useState } from 'react';
import { ArrowRight, Briefcase, GraduationCap, Hammer, HeartPulse, House, MapPin, Search, Store, Wallet } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useRegionContext } from '../context/RegionContext';
import { useAuth } from '../context/AuthContext';
import { api, BenefitMeasure, NavigatorMatch, NavigatorProfile } from '../api/client';
import { getCatalogCards, getNavigatorCards, inferNavigatorTopic, NavigatorAudience, NavigatorTopic, NAVIGATOR_AUDIENCES, PILOT_REGIONS } from '../data/navigator';

const topics = [
  { id: 'work', title: 'Работа', icon: Briefcase },
  { id: 'business', title: 'Своё дело', icon: Store },
  { id: 'education', title: 'Обучение', icon: GraduationCap },
  { id: 'health', title: 'Здоровье', icon: HeartPulse },
  { id: 'house', title: 'Свой дом', icon: Hammer },
  { id: 'housing', title: 'Жильё и переезд', icon: House },
  { id: 'payments', title: 'Выплаты', icon: Wallet },
] as const;

export function NavigatorPage() {
  const { region, openSelector } = useRegionContext();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<NavigatorTopic>('work');
  const [audience, setAudience] = useState<NavigatorAudience>('veteran');
  const [notice, setNotice] = useState('');
  const [locality, setLocality] = useState('');
  const [catalog, setCatalog] = useState<BenefitMeasure[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [profile, setProfile] = useState<NavigatorProfile>({ audience: 'veteran', disability: 'unknown', relationship: 'none', children_count: 0, housing: 'other' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [matches, setMatches] = useState<NavigatorMatch[] | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  useEffect(() => {
    if (!user) { setProfileSaved(false); setMatches(null); return; }
    let active = true;
    setProfileSaved(false);
    setMatches(null);
    api.getNavigatorProfile().then(({ profile: saved }) => {
      if (active && saved) { setProfile(saved); setAudience(saved.audience); setProfileSaved(true); }
    }).catch(() => { if (active) setProfileMessage('Анкета пока недоступна. Попробуйте позже.'); });
    return () => { active = false; };
  }, [user?.id]);
  useEffect(() => {
    if (!user || !profileSaved) { setMatches(null); return; }
    let active = true;
    setMatchesLoading(true);
    api.getNavigatorMatches(topic, locality).then(({ matches: found }) => {
      if (active) setMatches(found);
    }).catch(() => {
      if (active) { setMatches(null); setProfileMessage('Не удалось обновить персональный подбор.'); }
    }).finally(() => { if (active) setMatchesLoading(false); });
    return () => { active = false; };
  }, [user?.id, profileSaved, topic, locality, region?.id]);
  useEffect(() => { setLocality(''); }, [region?.id]);
  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    api.getPublishedMeasures(region?.id ?? null, locality).then((result) => {
      if (active) setCatalog(result.measures);
    }).catch(() => {
      if (active) setCatalog(null);
    }).finally(() => {
      if (active) setCatalogLoading(false);
    });
    return () => { active = false; };
  }, [region?.id, locality]);
  const cards = user && profileSaved ? matches ? getCatalogCards(matches.map((item) => item.measure), topic, audience) : [] : catalog ? getCatalogCards(catalog, topic, audience) : getNavigatorCards(topic, region?.id ?? null, audience).filter((card) => !card.source);
  const matchById = new Map(profileSaved ? matches?.map((item) => [String(item.measure.id), item]) || [] : []);
  const isPilotRegion = region && PILOT_REGIONS.some((id) => id === region.id);

  const submitQuery = (event: React.FormEvent) => {
    event.preventDefault();
    const inferred = inferNavigatorTopic(query);
    if (inferred) {
      setTopic(inferred);
      setNotice(`Подобрали направление «${topics.find((item) => item.id === inferred)?.title}» по вашему вопросу.`);
    } else {
      setNotice('Пока не удалось определить тему. Выберите направление ниже.');
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMessage('');
    try {
      const { profile: saved } = await api.saveNavigatorProfile(profile);
      setProfile(saved);
      setAudience(saved.audience);
      setProfileSaved(true);
      setProfileMessage('Анкета сохранена. Подбор обновлён.');
    } catch (error) { setProfileMessage(error instanceof Error ? error.message : 'Не удалось сохранить анкету'); }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#262626]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-[#525252]">
          <span className="rounded-full bg-[#e7eff6] px-3 py-1 font-semibold text-[#1e4976]">Проводник поддержки</span>
          <span>Поддержка шаг за шагом</span>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">С чего начнём?</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#525252]">
              Расскажите, что нужно сейчас. Проводник покажет подходящее направление и понятные шаги для вашего региона.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d9e6f2] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#525252]">Ваш регион</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-bold"><MapPin size={20} className="text-[#2c5f8d]" />{region?.name ?? 'Не выбран'}</p>
            <button type="button" onClick={openSelector} className="mt-3 text-sm font-semibold text-[#2c5f8d] underline underline-offset-4">Изменить регион</button>
            {region?.id === 'kaluga' && <label className="mt-4 flex items-start gap-3 border-t border-[#e5e5e5] pt-4 text-sm"><input type="checkbox" checked={locality === 'Калуга'} onChange={(event) => setLocality(event.target.checked ? 'Калуга' : '')} className="mt-0.5 h-5 w-5 accent-[#2c5f8d]" /><span>Показать также меры города Калуги. Право зависит от условий конкретной карточки.</span></label>}
          </div>
        </div>

        <section className="mt-9" aria-labelledby="navigator-audience-title">
          <h2 id="navigator-audience-title" className="text-xl font-bold">Кому нужна помощь?</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {NAVIGATOR_AUDIENCES.map((item) => <button type="button" key={item.id} onClick={() => { setAudience(item.id); setProfile((current) => ({ ...current, audience: item.id, relationship: ['family', 'bereaved-family'].includes(item.id) ? (current.relationship === 'none' ? 'spouse' : current.relationship) : 'none' })); setProfileSaved(false); }} aria-pressed={audience === item.id} className={`min-h-16 rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2c5f8d] ${audience === item.id ? 'border-[#2c5f8d] bg-[#e7eff6] text-[#163859]' : 'border-[#d4d4d4] bg-white hover:border-[#2c5f8d]'}`}>{item.title}</button>)}
          </div>
          <p className="mt-3 text-sm text-[#525252]">Выбор помогает показать подходящие карточки. Окончательное право на меру проверяется по её условиям.</p>
        </section>

        {user ? <section className="mt-8 rounded-2xl border border-[#d9e6f2] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="navigator-profile-title">
          <h2 id="navigator-profile-title" className="text-xl font-bold">Короткая анкета для подбора</h2>
          <p className="mt-2 text-sm text-[#525252]">Укажите только признаки, нужные для первичного подбора. ФИО и документы здесь не требуются. Ответы сохраняются в вашей учётной записи.</p>
          <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Инвалидность {['family', 'bereaved-family'].includes(profile.audience) ? 'участника' : 'ваша'}<select value={profile.disability} onChange={(event) => { setProfile((current) => ({ ...current, disability: event.target.value as NavigatorProfile['disability'] })); setProfileSaved(false); }} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-base"><option value="unknown">Не знаю / не указано</option><option value="none">Нет</option><option value="I">I группа</option><option value="II">II группа</option><option value="III">III группа</option></select></label>
            {['family', 'bereaved-family'].includes(profile.audience) && <label className="text-sm font-semibold">Кем вы приходитесь участнику?<select value={profile.relationship} onChange={(event) => { setProfile((current) => ({ ...current, relationship: event.target.value as NavigatorProfile['relationship'] })); setProfileSaved(false); }} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-base"><option value="spouse">Супруг / супруга</option><option value="parent">Родитель</option><option value="child">Ребёнок</option><option value="other">Другое родство</option></select></label>}
            <label className="text-sm font-semibold">Количество детей в семье<input type="number" min="0" max="30" value={profile.children_count} onChange={(event) => { setProfile((current) => ({ ...current, children_count: Number(event.target.value) })); setProfileSaved(false); }} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-base" /></label>
            <label className="text-sm font-semibold">Жилищная ситуация<select value={profile.housing} onChange={(event) => { setProfile((current) => ({ ...current, housing: event.target.value as NavigatorProfile['housing'] })); setProfileSaved(false); }} className="mt-2 min-h-12 w-full rounded-xl border px-3 text-base"><option value="other">Другое / пока не знаю</option><option value="own-home">Свой частный дом</option><option value="own-flat">Своя квартира</option><option value="rent">Снимаю жильё</option><option value="with-family">Живу с семьёй</option></select></label>
            <div className="sm:col-span-2"><button type="submit" className="min-h-12 w-full rounded-xl bg-[#2c5f8d] px-6 font-semibold text-white sm:w-auto">{profileSaved ? 'Обновить анкету' : 'Сохранить и подобрать меры'}</button>{profileMessage && <p role="status" className="mt-3 text-sm text-[#1e4976]">{profileMessage}</p>}</div>
          </form>
        </section> : <p className="mt-6 rounded-xl bg-white p-4 text-sm text-[#525252]">Для персонального подбора войдите в учётную запись и заполните короткую анкету. Общие карточки доступны ниже.</p>}

        <section className="mt-9 rounded-3xl bg-white p-5 shadow-sm sm:p-8" aria-labelledby="navigator-query-title">
          <h2 id="navigator-query-title" className="text-xl font-bold">Опишите задачу своими словами</h2>
          <p className="mt-1 text-sm text-[#737373]">Например: «Хочу найти подходящую работу». Не вводите ФИО, телефон и данные документов.</p>
          <form onSubmit={submitQuery} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="navigator-query">Ваш вопрос</label>
            <input id="navigator-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Что вы хотите решить?" className="min-h-12 flex-1 rounded-xl border border-[#b3cde0] px-4 text-base focus:border-[#2c5f8d] focus:outline focus:outline-2 focus:outline-[#2c5f8d]" />
            <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2c5f8d] px-6 font-semibold text-white hover:bg-[#1e4976] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2c5f8d]"><Search size={18} />Показать путь</button>
          </form>
          {notice && <p role="status" className="mt-4 text-sm font-medium text-[#1e4976]">{notice}</p>}
        </section>

        <section className="mt-10" aria-labelledby="navigator-topics-title">
          <h2 id="navigator-topics-title" className="text-2xl font-bold">Или выберите направление</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {topics.map((item) => {
              const Icon = item.icon;
              return <button type="button" key={item.id} onClick={() => { setTopic(item.id); setNotice(''); }} aria-pressed={topic === item.id} className={`flex min-h-28 flex-col items-start justify-between rounded-2xl border p-4 text-left font-semibold transition-colors focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#2c5f8d] ${topic === item.id ? 'border-[#2c5f8d] bg-[#e7eff6] text-[#163859]' : 'border-[#d4d4d4] bg-white hover:border-[#2c5f8d]'}`}><Icon size={26} /><span>{item.title}</span></button>;
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="navigator-path-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2c5f8d]">Ваш путь</p>
              <h2 id="navigator-path-title" className="mt-1 text-2xl font-bold">{topics.find((item) => item.id === topic)?.title}: возможные пути</h2>
            </div>
            <span className="text-sm text-[#737373]">{catalogLoading || matchesLoading ? 'Загружаем меры…' : `Карточек: ${cards.length}`}</span>
          </div>
          {!isPilotRegion && <p className="mt-5 rounded-xl border border-[#d9e6f2] bg-[#f0f4f8] p-4 text-sm text-[#404040]">Региональные сценарии прототипа сейчас показаны только для Владимирской и Калужской областей. Выберите один из этих регионов, чтобы увидеть пример.</p>}
          {!catalogLoading && catalog === null && <p className="mt-5 rounded-xl border border-[#eedab0] bg-[#fffbeb] p-4 text-sm text-[#5c470f]">Каталог сервера сейчас недоступен. Показаны только демонстрационные сценарии без действующих мер.</p>}
          {cards.length === 0 && !matchesLoading && (!user || !profileSaved || matches !== null) && <p className="mt-5 rounded-xl border border-[#d9e6f2] bg-white p-5 text-sm text-[#404040]">Для этой группы и темы карточки ещё не добавлены или не совпали с ответами анкеты. Это не означает отсутствия права на поддержку — каталог пока наполняется.</p>}
          {user && profileSaved && !matchesLoading && matches === null && <p className="mt-5 rounded-xl border border-[#eedab0] bg-[#fffbeb] p-4 text-sm text-[#5c470f]">Персональный подбор сейчас недоступен. Попробуйте обновить страницу позже.</p>}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => <article key={card.id} className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
              <span className="rounded-full bg-[#f0f4f8] px-3 py-1 text-xs font-semibold text-[#2c5f8d]">{card.regionId === 'all' ? (card.source ? 'Федеральная мера' : 'Общий сценарий') : region?.name}</span>
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#525252]">{card.purpose}</p>
              {matchById.has(card.id) && <div className="mt-4 rounded-xl border border-[#c7d9e9] bg-[#f0f4f8] p-4 text-sm leading-relaxed"><p className="font-semibold text-[#163859]">Почему показана</p><ul className="mt-2 list-disc pl-5">{matchById.get(card.id)?.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><p className="mt-3 font-semibold text-[#5c470f]">Что проверить</p><ul className="mt-1 list-disc pl-5 text-[#5c470f]">{matchById.get(card.id)?.checks.map((check) => <li key={check}>{check}</li>)}</ul></div>}
              {card.eligibility && <p className="mt-4 rounded-xl bg-[#f0f4f8] p-4 text-sm leading-relaxed"><strong>Кому подходит: </strong>{card.eligibility}</p>}
              <ol className="mt-6 space-y-4">
                {card.steps.map((step, index) => <li key={step.title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7eff6] text-sm font-bold text-[#1e4976]">{index + 1}</span><div><p className="font-semibold">{step.title}</p><p className="mt-1 text-sm leading-relaxed text-[#525252]">{step.detail}</p></div></li>)}
              </ol>
              {card.source ? <div className="mt-6 space-y-3 border-t border-[#e5e5e5] pt-5 text-sm leading-relaxed text-[#404040]">
                <p><strong>Документы:</strong> {card.documents}</p>
                <p><strong>Куда обратиться:</strong> {card.where}</p>
                <p><strong>Срок:</strong> {card.timing}</p>
                <p className="rounded-xl bg-[#fffbeb] p-3 text-[#5c470f]"><strong>Важно:</strong> {card.important}</p>
                <a href={card.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#2c5f8d] underline underline-offset-4">Официальный источник: {card.source.label} <ArrowRight size={16} /></a>
                <p className="text-xs text-[#737373]">Информация сверена {card.source.checkedAt}. Условия могут измениться — проверьте их перед обращением.</p>
              </div> : <div className="mt-6 flex items-center gap-2 border-t border-[#e5e5e5] pt-4 text-sm font-medium text-[#737373]"><ArrowRight size={16} />Карточка меры появится после проверки источников</div>}
            </article>)}
          </div>
        </section>

        <aside className="mt-10 rounded-2xl border border-[#eedab0] bg-[#fffbeb] p-5 text-sm leading-relaxed text-[#5c470f]">
          <strong>Проводник в разработке.</strong> Карточки со ссылкой на официальный источник содержат сведения из него; демонстрационные сценарии показывают только пример интерфейса. Выбор группы и темы не подтверждает право на меру. Текст вопроса обрабатывается только в браузере и никуда не отправляется.
        </aside>
      </main>
      <Footer />
    </div>
  );
}

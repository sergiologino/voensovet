import { useEffect, useState } from 'react';
import { api, BenefitMeasure, BenefitMeasureInput } from '../../api/client';
import { REGIONS } from '../../constants/regions';

const TOPICS = [
  ['work', 'Работа'], ['business', 'Своё дело'], ['education', 'Обучение'], ['health', 'Здоровье'],
  ['house', 'Свой дом'], ['housing', 'Жильё и переезд'], ['payments', 'Выплаты'],
] as const;
const AUDIENCES = [
  ['veteran', 'Ветеран с удостоверением'], ['status-pending', 'Оформляет статус'],
  ['family', 'Член семьи'], ['bereaved-family', 'Семья погибшего'],
] as const;

const emptyMeasure = (): BenefitMeasureInput => ({
  title: '', topic: 'payments', scope: 'federal', region_id: null, locality: '', audiences: [],
  match_rules: {},
  summary: '', eligibility: '', exclusions: '', documents: [], steps: [{ title: '', detail: '' }],
  agency: '', apply_url: '', timing: '', source_url: '', source_checked_at: null, date_end: null,
});

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-[#b9c4ce] bg-white px-3 py-2 text-base';
const textareaClass = `${inputClass} min-h-24`;

export function MeasureEditor() {
  const [measures, setMeasures] = useState<BenefitMeasure[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<BenefitMeasureInput>(emptyMeasure);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', scope: '', regionId: '', topic: '', validity: '' });
  const selected = measures.find((item) => item.id === selectedId);

  const load = async () => {
    try {
      const result = await api.getAdminMeasures(filters);
      setMeasures(result.measures);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось загрузить меры');
    }
  };

  useEffect(() => { void load(); }, [filters]);

  const choose = (measure: BenefitMeasure) => {
    setSelectedId(measure.id);
    setForm({
      title: measure.title, topic: measure.topic, scope: measure.scope, region_id: measure.region_id, locality: measure.locality,
      audiences: [...measure.audiences], summary: measure.summary, eligibility: measure.eligibility,
      match_rules: { ...measure.match_rules },
      exclusions: measure.exclusions, documents: [...measure.documents],
      steps: measure.steps.map((step) => ({ ...step })), agency: measure.agency,
      apply_url: measure.apply_url, timing: measure.timing, source_url: measure.source_url,
      source_checked_at: measure.source_checked_at?.slice(0, 10) || null,
      date_end: measure.date_end?.slice(0, 10) || null,
    });
    setMessage('');
  };

  const save = async (publish = false) => {
    setBusy(true);
    setMessage('');
    try {
      const payload = { ...form, documents: form.documents.map((item) => item.trim()).filter(Boolean), steps: form.steps.filter((step) => step.title.trim() || step.detail.trim()) };
      const result = selectedId
        ? await api.updateAdminMeasure(selectedId, payload)
        : await api.createAdminMeasure(payload);
      const id = result.measure.id;
      setSelectedId(id);
      if (!publish) choose(result.measure);
      const finalResult = publish ? await api.publishAdminMeasure(id) : result;
      await load();
      choose(finalResult.measure);
      setMessage(publish ? 'Мера опубликована' : 'Черновик сохранён');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось сохранить меру');
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    if (!selectedId) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await api.unpublishAdminMeasure(selectedId);
      await load();
      choose(result.measure);
      setMessage('Мера снята с публикации');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось снять меру с публикации');
    } finally {
      setBusy(false);
    }
  };

  const setText = (field: keyof BenefitMeasureInput, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const setFilter = (field: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [field]: value }));

  return <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Каталог мер поддержки</h2>
      <p className="mt-2 text-sm text-[#525252]">Сначала сохраните черновик. Публикуйте карточку только после проверки условий и первоисточника. Изменение опубликованной карточки вернёт её в черновики.</p>
    </div>
    {message && <p role="status" className="rounded-xl bg-[#e7eff6] p-3 text-sm text-[#163859]">{message}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.7fr)]">
      <div className="space-y-3">
        <button type="button" onClick={() => { setSelectedId(null); setForm(emptyMeasure()); setMessage(''); }} className="min-h-11 w-full rounded-xl bg-[#2c5f8d] px-4 font-semibold text-white">Новая мера</button>
        <div className="grid gap-2 rounded-xl border border-[#d4d4d4] p-3">
          <label className="text-xs font-semibold">Поиск по названию<input value={filters.search} onChange={(event) => setFilter('search', event.target.value)} className={inputClass} placeholder="Название меры" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-semibold">Статус<select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className={inputClass}><option value="">Все</option><option value="draft">Черновики</option><option value="published">Опубликованы</option></select></label>
            <label className="text-xs font-semibold">Состояние<select value={filters.validity} onChange={(event) => setFilter('validity', event.target.value)} className={inputClass}><option value="">Все</option><option value="active">Действуют</option><option value="expired">Завершились</option><option value="needs-review">Проверить источник</option><option value="new">Новые за 30 дней</option></select></label>
            <label className="text-xs font-semibold">Охват<select value={filters.scope} onChange={(event) => setFilter('scope', event.target.value)} className={inputClass}><option value="">Все</option><option value="federal">Федеральные</option><option value="regional">Региональные</option></select></label>
            <label className="text-xs font-semibold">Тема<select value={filters.topic} onChange={(event) => setFilter('topic', event.target.value)} className={inputClass}><option value="">Все</option>{TOPICS.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
          </div>
          <label className="text-xs font-semibold">Регион<select value={filters.regionId} onChange={(event) => setFilter('regionId', event.target.value)} className={inputClass}><option value="">Все</option>{REGIONS.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>
        </div>
        <p className="text-xs text-[#525252]">Найдено: {measures.length}</p>
        {measures.length === 0 && <p className="text-sm text-[#737373]">В каталоге пока нет карточек.</p>}
        {measures.map((measure) => <button type="button" key={measure.id} onClick={() => choose(measure)} className={`w-full rounded-xl border p-4 text-left ${selectedId === measure.id ? 'border-[#2c5f8d] bg-[#e7eff6]' : 'border-[#d4d4d4] bg-white'}`}>
          <span className="block font-semibold">{measure.title}</span>
          <span className="mt-1 block text-xs text-[#525252]">{measure.status === 'published' ? 'Опубликована' : 'Черновик'} · {measure.scope === 'federal' ? 'Вся Россия' : REGIONS.find((region) => region.id === measure.region_id)?.name || measure.region_id}{measure.locality ? ` · ${measure.locality}` : ''}{measure.date_end ? ` · до ${measure.date_end.slice(0, 10)}` : ''}</span>
        </button>)}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-5 rounded-2xl border border-[#d4d4d4] bg-white p-4 sm:p-6">
        <h3 className="text-xl font-bold">{selected ? `Редактирование: ${selected.title}` : 'Новая карточка'}</h3>
        <label className="block text-sm font-semibold">Название<input value={form.title} onChange={(event) => setText('title', event.target.value)} className={inputClass} required maxLength={200} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Тема<select value={form.topic} onChange={(event) => setText('topic', event.target.value)} className={inputClass}>{TOPICS.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
          <label className="block text-sm font-semibold">Охват<select value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value as BenefitMeasureInput['scope'], region_id: event.target.value === 'federal' ? null : 'vladimir', locality: event.target.value === 'federal' ? '' : current.locality }))} className={inputClass}><option value="federal">Вся Россия</option><option value="regional">Регион</option></select></label>
        </div>
        {form.scope === 'regional' && <label className="block text-sm font-semibold">Регион<select value={form.region_id || 'vladimir'} onChange={(event) => setText('region_id', event.target.value)} className={inputClass}>{REGIONS.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>}
        {form.scope === 'regional' && <label className="block text-sm font-semibold">Населённый пункт, если мера действует только там<input value={form.locality} onChange={(event) => setText('locality', event.target.value)} className={inputClass} maxLength={100} placeholder="Например: Калуга. Оставьте пустым для всей области." /></label>}
        <fieldset className="rounded-xl border border-[#d4d4d4] p-4"><legend className="px-1 text-sm font-semibold">Целевые группы</legend><div className="grid gap-2 sm:grid-cols-2">{AUDIENCES.map(([id, title]) => <label key={id} className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={form.audiences.includes(id)} onChange={(event) => setForm((current) => ({ ...current, audiences: event.target.checked ? [...current.audiences, id] : current.audiences.filter((item) => item !== id) }))} className="h-5 w-5 accent-[#2c5f8d]" />{title}</label>)}</div></fieldset>
        <fieldset className="rounded-xl border border-[#d4d4d4] p-4"><legend className="px-1 text-sm font-semibold">Правила первичного подбора</legend>
          <p className="mb-3 text-xs font-normal text-[#525252]">Заполняйте только условия, подтверждённые официальным источником. Остальные условия останутся для проверки перед обращением.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Родство для группы «Член семьи»<select className={inputClass} value={form.match_rules?.family_relationship || ''} onChange={(event) => setForm((current) => ({ ...current, match_rules: { ...current.match_rules, family_relationship: event.target.value ? event.target.value as 'spouse' : undefined } }))}><option value="">Любое</option><option value="spouse">Супруг или супруга</option></select></label>
            <label className="text-sm font-semibold">Группа инвалидности участника для семьи<select className={inputClass} value={form.match_rules?.participant_disability?.join(',') || ''} onChange={(event) => setForm((current) => ({ ...current, match_rules: { ...current.match_rules, participant_disability: event.target.value ? event.target.value.split(',') as ('I' | 'II' | 'III')[] : undefined } }))}><option value="">Не требуется</option><option value="I,II">I или II</option><option value="I">I</option><option value="II">II</option><option value="III">III</option></select></label>
            <label className="text-sm font-semibold">Не менее детей<select className={inputClass} value={form.match_rules?.min_children || ''} onChange={(event) => setForm((current) => ({ ...current, match_rules: { ...current.match_rules, min_children: event.target.value ? Number(event.target.value) : undefined } }))}><option value="">Без ограничения</option><option value="3">3</option></select></label>
            <label className="text-sm font-semibold">Жилищная ситуация<select className={inputClass} value={form.match_rules?.housing || ''} onChange={(event) => setForm((current) => ({ ...current, match_rules: { ...current.match_rules, housing: event.target.value ? event.target.value as 'own-home' : undefined } }))}><option value="">Любая</option><option value="own-home">Свой частный дом</option></select></label>
          </div>
          <label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={!!form.match_rules?.requires_award} onChange={(event) => setForm((current) => ({ ...current, match_rules: { ...current.match_rules, requires_award: event.target.checked } }))} />Нужна государственная награда — показать напоминание о проверке</label>
          <label className="mt-2 flex gap-2 text-sm"><input type="checkbox" checked={!!form.match_rules?.requires_veteran_card} onChange={(event) => setForm((current) => ({ ...current, match_rules: { ...current.match_rules, requires_veteran_card: event.target.checked } }))} />Нужно удостоверение ветерана — предупредить при оформлении статуса</label>
        </fieldset>
        <label className="block text-sm font-semibold">Краткое описание<textarea value={form.summary} onChange={(event) => setText('summary', event.target.value)} className={textareaClass} /></label>
        <label className="block text-sm font-semibold">Кому положено и при каких условиях<textarea value={form.eligibility} onChange={(event) => setText('eligibility', event.target.value)} className={textareaClass} /></label>
        <label className="block text-sm font-semibold">Исключения и ограничения<textarea value={form.exclusions} onChange={(event) => setText('exclusions', event.target.value)} className={textareaClass} /></label>
        <label className="block text-sm font-semibold">Документы — один на строку<textarea value={form.documents.join('\n')} onChange={(event) => setForm((current) => ({ ...current, documents: event.target.value.split('\n') }))} className={textareaClass} /></label>
        <fieldset className="space-y-3 rounded-xl border border-[#d4d4d4] p-4"><legend className="px-1 text-sm font-semibold">Шаги обращения</legend>{form.steps.map((step, index) => <div key={index} className="rounded-lg bg-[#f7f9fb] p-3"><label className="block text-xs font-semibold">Шаг {index + 1}<input value={step.title} onChange={(event) => setForm((current) => ({ ...current, steps: current.steps.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} className={inputClass} /></label><label className="mt-2 block text-xs font-semibold">Что сделать<textarea value={step.detail} onChange={(event) => setForm((current) => ({ ...current, steps: current.steps.map((item, itemIndex) => itemIndex === index ? { ...item, detail: event.target.value } : item) }))} className={textareaClass} /></label><button type="button" onClick={() => setForm((current) => ({ ...current, steps: current.steps.filter((_, itemIndex) => itemIndex !== index) }))} className="mt-2 text-sm text-[#8b3030] underline">Убрать шаг</button></div>)}<button type="button" onClick={() => setForm((current) => ({ ...current, steps: [...current.steps, { title: '', detail: '' }] }))} className="text-sm font-semibold text-[#2c5f8d] underline">Добавить шаг</button></fieldset>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Куда обратиться<input value={form.agency} onChange={(event) => setText('agency', event.target.value)} className={inputClass} /></label><label className="block text-sm font-semibold">Сроки<input value={form.timing} onChange={(event) => setText('timing', event.target.value)} className={inputClass} /></label></div>
        <label className="block text-sm font-semibold">Ссылка для обращения, если есть<input type="url" value={form.apply_url} onChange={(event) => setText('apply_url', event.target.value)} className={inputClass} placeholder="https://" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Официальный первоисточник<input type="url" value={form.source_url} onChange={(event) => setText('source_url', event.target.value)} className={inputClass} placeholder="https://" />{form.source_url.startsWith('https://') && <a href={form.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#2c5f8d] underline">Открыть источник для проверки</a>}</label><label className="block text-sm font-semibold">Дата проверки источника<input type="date" value={form.source_checked_at || ''} onChange={(event) => setText('source_checked_at', event.target.value)} className={inputClass} /><button type="button" onClick={() => setText('source_checked_at', new Date().toLocaleDateString('sv-SE'))} className="mt-2 text-xs text-[#2c5f8d] underline">Проверено сегодня</button></label></div>
        <label className="block text-sm font-semibold">Дата окончания действия, если мера завершена<input type="date" value={form.date_end || ''} onChange={(event) => setText('date_end', event.target.value)} className={inputClass} /><span className="mt-1 block text-xs font-normal text-[#525252]">После этой даты мера автоматически исчезнет из публичного каталога. Сохранение изменений вернёт карточку в черновики.</span></label>
        <div className="flex flex-wrap gap-3 border-t border-[#e5e5e5] pt-5"><button type="submit" disabled={busy} className="min-h-11 rounded-xl border border-[#2c5f8d] px-5 font-semibold text-[#2c5f8d] disabled:opacity-50">Сохранить черновик</button><button type="button" disabled={busy} onClick={() => void save(true)} className="min-h-11 rounded-xl bg-[#2c5f8d] px-5 font-semibold text-white disabled:opacity-50">Сохранить и опубликовать</button>{selected?.status === 'published' && <button type="button" disabled={busy} onClick={() => void unpublish()} className="min-h-11 rounded-xl border border-[#8b3030] px-5 font-semibold text-[#8b3030] disabled:opacity-50">Снять с публикации</button>}</div>
      </form>
    </div>
  </section>;
}

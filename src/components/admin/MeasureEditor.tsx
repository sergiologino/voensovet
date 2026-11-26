import { useEffect, useState } from 'react';
import { api, BenefitMeasure, BenefitMeasureInput } from '../../api/client';
import { REGIONS } from '../../constants/regions';

const TOPICS = [
  ['work', 'Работа'], ['business', 'Своё дело'], ['education', 'Обучение'],
  ['house', 'Свой дом'], ['housing', 'Жильё и переезд'], ['payments', 'Выплаты'],
] as const;
const AUDIENCES = [
  ['veteran', 'Ветеран с удостоверением'], ['status-pending', 'Оформляет статус'],
  ['family', 'Член семьи'], ['bereaved-family', 'Семья погибшего'],
] as const;

const emptyMeasure = (): BenefitMeasureInput => ({
  title: '', topic: 'payments', scope: 'federal', region_id: null, locality: '', audiences: [],
  summary: '', eligibility: '', exclusions: '', documents: [], steps: [{ title: '', detail: '' }],
  agency: '', apply_url: '', timing: '', source_url: '', source_checked_at: null,
});

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-[#b9c4ce] bg-white px-3 py-2 text-base';
const textareaClass = `${inputClass} min-h-24`;

export function MeasureEditor() {
  const [measures, setMeasures] = useState<BenefitMeasure[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<BenefitMeasureInput>(emptyMeasure);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const selected = measures.find((item) => item.id === selectedId);

  const load = async () => {
    try {
      const result = await api.getAdminMeasures();
      setMeasures(result.measures);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не удалось загрузить меры');
    }
  };

  useEffect(() => { void load(); }, []);

  const choose = (measure: BenefitMeasure) => {
    setSelectedId(measure.id);
    setForm({
      title: measure.title, topic: measure.topic, scope: measure.scope, region_id: measure.region_id, locality: measure.locality,
      audiences: [...measure.audiences], summary: measure.summary, eligibility: measure.eligibility,
      exclusions: measure.exclusions, documents: [...measure.documents],
      steps: measure.steps.map((step) => ({ ...step })), agency: measure.agency,
      apply_url: measure.apply_url, timing: measure.timing, source_url: measure.source_url,
      source_checked_at: measure.source_checked_at?.slice(0, 10) || null,
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

  return <section className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Каталог мер поддержки</h2>
      <p className="mt-2 text-sm text-[#525252]">Сначала сохраните черновик. Публикуйте карточку только после проверки условий и первоисточника. Изменение опубликованной карточки вернёт её в черновики.</p>
    </div>
    {message && <p role="status" className="rounded-xl bg-[#e7eff6] p-3 text-sm text-[#163859]">{message}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.7fr)]">
      <div className="space-y-3">
        <button type="button" onClick={() => { setSelectedId(null); setForm(emptyMeasure()); setMessage(''); }} className="min-h-11 w-full rounded-xl bg-[#2c5f8d] px-4 font-semibold text-white">Новая мера</button>
        {measures.length === 0 && <p className="text-sm text-[#737373]">В каталоге пока нет карточек.</p>}
        {measures.map((measure) => <button type="button" key={measure.id} onClick={() => choose(measure)} className={`w-full rounded-xl border p-4 text-left ${selectedId === measure.id ? 'border-[#2c5f8d] bg-[#e7eff6]' : 'border-[#d4d4d4] bg-white'}`}>
          <span className="block font-semibold">{measure.title}</span>
          <span className="mt-1 block text-xs text-[#525252]">{measure.status === 'published' ? 'Опубликована' : 'Черновик'} · {measure.scope === 'federal' ? 'Вся Россия' : REGIONS.find((region) => region.id === measure.region_id)?.name || measure.region_id}{measure.locality ? ` · ${measure.locality}` : ''}</span>
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
        <label className="block text-sm font-semibold">Краткое описание<textarea value={form.summary} onChange={(event) => setText('summary', event.target.value)} className={textareaClass} /></label>
        <label className="block text-sm font-semibold">Кому положено и при каких условиях<textarea value={form.eligibility} onChange={(event) => setText('eligibility', event.target.value)} className={textareaClass} /></label>
        <label className="block text-sm font-semibold">Исключения и ограничения<textarea value={form.exclusions} onChange={(event) => setText('exclusions', event.target.value)} className={textareaClass} /></label>
        <label className="block text-sm font-semibold">Документы — один на строку<textarea value={form.documents.join('\n')} onChange={(event) => setForm((current) => ({ ...current, documents: event.target.value.split('\n') }))} className={textareaClass} /></label>
        <fieldset className="space-y-3 rounded-xl border border-[#d4d4d4] p-4"><legend className="px-1 text-sm font-semibold">Шаги обращения</legend>{form.steps.map((step, index) => <div key={index} className="rounded-lg bg-[#f7f9fb] p-3"><label className="block text-xs font-semibold">Шаг {index + 1}<input value={step.title} onChange={(event) => setForm((current) => ({ ...current, steps: current.steps.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} className={inputClass} /></label><label className="mt-2 block text-xs font-semibold">Что сделать<textarea value={step.detail} onChange={(event) => setForm((current) => ({ ...current, steps: current.steps.map((item, itemIndex) => itemIndex === index ? { ...item, detail: event.target.value } : item) }))} className={textareaClass} /></label><button type="button" onClick={() => setForm((current) => ({ ...current, steps: current.steps.filter((_, itemIndex) => itemIndex !== index) }))} className="mt-2 text-sm text-[#8b3030] underline">Убрать шаг</button></div>)}<button type="button" onClick={() => setForm((current) => ({ ...current, steps: [...current.steps, { title: '', detail: '' }] }))} className="text-sm font-semibold text-[#2c5f8d] underline">Добавить шаг</button></fieldset>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Куда обратиться<input value={form.agency} onChange={(event) => setText('agency', event.target.value)} className={inputClass} /></label><label className="block text-sm font-semibold">Сроки<input value={form.timing} onChange={(event) => setText('timing', event.target.value)} className={inputClass} /></label></div>
        <label className="block text-sm font-semibold">Ссылка для обращения, если есть<input type="url" value={form.apply_url} onChange={(event) => setText('apply_url', event.target.value)} className={inputClass} placeholder="https://" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Официальный первоисточник<input type="url" value={form.source_url} onChange={(event) => setText('source_url', event.target.value)} className={inputClass} placeholder="https://" /></label><label className="block text-sm font-semibold">Дата проверки источника<input type="date" value={form.source_checked_at || ''} onChange={(event) => setText('source_checked_at', event.target.value)} className={inputClass} /></label></div>
        <div className="flex flex-wrap gap-3 border-t border-[#e5e5e5] pt-5"><button type="submit" disabled={busy} className="min-h-11 rounded-xl border border-[#2c5f8d] px-5 font-semibold text-[#2c5f8d] disabled:opacity-50">Сохранить черновик</button><button type="button" disabled={busy} onClick={() => void save(true)} className="min-h-11 rounded-xl bg-[#2c5f8d] px-5 font-semibold text-white disabled:opacity-50">Сохранить и опубликовать</button>{selected?.status === 'published' && <button type="button" disabled={busy} onClick={() => void unpublish()} className="min-h-11 rounded-xl border border-[#8b3030] px-5 font-semibold text-[#8b3030] disabled:opacity-50">Снять с публикации</button>}</div>
      </form>
    </div>
  </section>;
}

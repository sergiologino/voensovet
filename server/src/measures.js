export const MEASURE_TOPICS = ['work', 'business', 'education', 'health', 'house', 'housing', 'payments'];
export const MEASURE_AUDIENCES = ['veteran', 'status-pending', 'family', 'bereaved-family'];

const clean = (value) => typeof value === 'string' ? value.trim() : '';
const cleanDate = (value) => value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString().slice(0, 10) : clean(value);
const validUrl = (value) => !value || /^https:\/\/[^\s]+$/i.test(value);
const validDate = (value) => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));

export function normalizeMeasure(input, forPublication = false) {
  const measure = {
    title: clean(input?.title),
    topic: clean(input?.topic),
    scope: clean(input?.scope),
    region_id: clean(input?.region_id) || null,
    locality: clean(input?.locality),
    audiences: input?.audiences,
    match_rules: input?.match_rules || {},
    summary: clean(input?.summary),
    eligibility: clean(input?.eligibility),
    exclusions: clean(input?.exclusions),
    documents: input?.documents,
    steps: input?.steps,
    agency: clean(input?.agency),
    apply_url: clean(input?.apply_url),
    timing: clean(input?.timing),
    source_url: clean(input?.source_url),
    source_checked_at: cleanDate(input?.source_checked_at) || null,
    date_end: cleanDate(input?.date_end) || null,
  };

  if (!measure.title || measure.title.length > 200) return { error: 'Укажите название меры до 200 символов' };
  if (!MEASURE_TOPICS.includes(measure.topic)) return { error: 'Выберите корректную тему' };
  if (!['federal', 'regional'].includes(measure.scope)) return { error: 'Выберите федеральный или региональный охват' };
  if (measure.scope === 'federal') { measure.region_id = null; measure.locality = ''; }
  if (measure.scope === 'regional' && !/^[a-z][a-z_]{1,40}$/.test(measure.region_id || '')) return { error: 'Укажите корректный регион' };
  if (measure.locality.length > 100) return { error: 'Название населённого пункта слишком длинное' };
  if (!Array.isArray(measure.audiences) || !measure.audiences.every((item) => MEASURE_AUDIENCES.includes(item))) return { error: 'Проверьте целевые группы' };
  measure.audiences = [...new Set(measure.audiences)];
  const rules = measure.match_rules;
  if (!rules || Array.isArray(rules) || typeof rules !== 'object' || Object.keys(rules).some((key) => !['family_relationship', 'participant_disability', 'min_children', 'housing', 'requires_award', 'requires_veteran_card'].includes(key))) return { error: 'Проверьте правила подбора' };
  if (rules.family_relationship !== undefined && !['spouse', 'parent', 'child', 'other'].includes(rules.family_relationship)) return { error: 'Проверьте родство в правилах подбора' };
  if (rules.participant_disability !== undefined && (!Array.isArray(rules.participant_disability) || !rules.participant_disability.length || !rules.participant_disability.every((item) => ['I', 'II', 'III'].includes(item)))) return { error: 'Проверьте группу инвалидности в правилах подбора' };
  if (rules.min_children !== undefined && (!Number.isInteger(rules.min_children) || rules.min_children < 1 || rules.min_children > 30)) return { error: 'Проверьте число детей в правилах подбора' };
  if (rules.housing !== undefined && !['own-home', 'own-flat', 'rent', 'with-family', 'other'].includes(rules.housing)) return { error: 'Проверьте жильё в правилах подбора' };
  if (['requires_award', 'requires_veteran_card'].some((key) => rules[key] !== undefined && typeof rules[key] !== 'boolean')) return { error: 'Проверьте дополнительные условия подбора' };
  if (!Array.isArray(measure.documents) || !measure.documents.every((item) => typeof item === 'string' && item.trim())) return { error: 'Проверьте список документов' };
  measure.documents = measure.documents.map((item) => item.trim());
  if (!Array.isArray(measure.steps) || !measure.steps.every((item) => item && clean(item.title) && clean(item.detail))) return { error: 'Проверьте шаги обращения' };
  measure.steps = measure.steps.map((item) => ({ title: clean(item.title), detail: clean(item.detail) }));
  if (!validUrl(measure.source_url) || !validUrl(measure.apply_url)) return { error: 'Ссылки должны начинаться с https://' };
  if (!validDate(measure.source_checked_at)) return { error: 'Укажите дату проверки в формате ГГГГ-ММ-ДД' };
  if (!validDate(measure.date_end)) return { error: 'Укажите дату окончания в формате ГГГГ-ММ-ДД' };
  if (forPublication && measure.date_end && measure.date_end < new Date().toISOString().slice(0, 10)) return { error: 'Мера с истёкшим сроком не может быть опубликована' };
  if (forPublication && (!measure.summary || !measure.eligibility || !measure.audiences.length || !measure.documents.length || !measure.steps.length || !measure.agency || !measure.timing || !measure.source_url || !measure.source_checked_at)) {
    return { error: 'Для публикации заполните описание, условия, группы, документы, шаги, ведомство, сроки, источник и дату проверки' };
  }
  return { measure };
}

import { MEASURE_AUDIENCES } from './measures.js';

export const DISABILITY = ['none', 'I', 'II', 'III', 'unknown'];
export const RELATIONSHIPS = ['spouse', 'parent', 'child', 'other', 'none'];
export const HOUSING = ['own-home', 'own-flat', 'rent', 'with-family', 'other'];

export function normalizeNavigatorProfile(input) {
  const profile = {
    audience: input?.audience,
    disability: input?.disability,
    relationship: input?.relationship,
    children_count: input?.children_count,
    housing: input?.housing,
  };
  if (!MEASURE_AUDIENCES.includes(profile.audience)) return { error: 'Выберите, кому нужна помощь' };
  if (!DISABILITY.includes(profile.disability)) return { error: 'Укажите наличие инвалидности или выберите «Не знаю»' };
  if (!RELATIONSHIPS.includes(profile.relationship)) return { error: 'Укажите родство с участником или выберите «Не относится»' };
  if (!Number.isInteger(profile.children_count) || profile.children_count < 0 || profile.children_count > 30) return { error: 'Укажите количество детей от 0 до 30' };
  if (!HOUSING.includes(profile.housing)) return { error: 'Укажите жилищную ситуацию' };
  if (['family', 'bereaved-family'].includes(profile.audience) && profile.relationship === 'none') return { error: 'Для семьи укажите родство с участником' };
  if (!['family', 'bereaved-family'].includes(profile.audience)) profile.relationship = 'none';
  return { profile };
}

// Правила ограничены проверенными признаками. Пустое правило оставляет право на проверку ведомством.
export function evaluateMeasure(measure, profile) {
  if (!measure.audiences.includes(profile.audience)) return null;
  const reasons = ['Мера предназначена для выбранной группы'];
  const checks = [];
  const rules = measure.match_rules || {};
  if (rules.family_relationship && profile.audience === 'family') {
    if (profile.relationship !== rules.family_relationship) return null;
    reasons.push('Указанное родство соответствует условиям карточки');
  }
  if (rules.participant_disability && profile.audience === 'family') {
    if (profile.disability === 'unknown') checks.push('Уточните группу инвалидности участника');
    else if (!rules.participant_disability.includes(profile.disability)) return null;
    else reasons.push('Указанная группа инвалидности соответствует условию');
  }
  if (rules.min_children) {
    if (profile.children_count < rules.min_children) return null;
    reasons.push('Указано не менее трёх детей; статус многодетной семьи подтвердите отдельно');
  }
  if (rules.housing) {
    if (profile.housing !== rules.housing) return null;
    reasons.push('Указана подходящая жилищная ситуация');
  }
  if (rules.requires_award && ['veteran', 'status-pending'].includes(profile.audience)) checks.push('Проверьте наличие требуемой государственной награды');
  if (rules.requires_veteran_card && profile.audience === 'status-pending') checks.push('Для обращения потребуется удостоверение ветерана боевых действий');
  checks.push('Сверьте остальные условия и документы на официальной странице');
  return { measure, reasons, checks };
}

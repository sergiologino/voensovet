import { describe, expect, it } from 'vitest';
import { normalizeMeasure } from './measures.js';

const draft = {
  title: 'Мера', topic: 'house', scope: 'regional', region_id: 'vladimir', locality: '',
  audiences: [], summary: '', eligibility: '', exclusions: '', documents: [], steps: [],
  agency: '', apply_url: '', timing: '', source_url: '', source_checked_at: null,
};

describe('benefit measure validation', () => {
  it('allows incomplete drafts but blocks publication', () => {
    expect(normalizeMeasure(draft).measure).toBeTruthy();
    expect(normalizeMeasure(draft, true).error).toContain('Для публикации');
  });

  it('requires a region for regional measures and removes it for federal measures', () => {
    expect(normalizeMeasure({ ...draft, region_id: null }).error).toContain('регион');
    expect(normalizeMeasure({ ...draft, scope: 'federal', locality: 'Калуга' }).measure.region_id).toBeNull();
    expect(normalizeMeasure({ ...draft, scope: 'federal', locality: 'Калуга' }).measure.locality).toBe('');
  });

  it('rejects malformed source links and incomplete steps', () => {
    expect(normalizeMeasure({ ...draft, source_url: 'http://example.test' }).error).toContain('https://');
    expect(normalizeMeasure({ ...draft, steps: [{ title: 'Обратиться', detail: '' }] }).error).toContain('шаги');
  });

  it('accepts a database date when a saved measure is published', () => {
    const complete = { ...draft, audiences: ['veteran'], summary: 'Описание', eligibility: 'Условия', documents: ['Заявление'], steps: [{ title: 'Подать', detail: 'В ведомство' }], agency: 'Соцзащита', timing: '10 дней', source_url: 'https://example.test', source_checked_at: new Date('2026-11-26T00:00:00.000Z') };
    expect(normalizeMeasure(complete, true).measure.source_checked_at).toBe('2026-11-26');
  });

  it('does not publish a measure whose end date has passed', () => {
    const complete = { ...draft, audiences: ['veteran'], summary: 'Описание', eligibility: 'Условия', documents: ['Заявление'], steps: [{ title: 'Подать', detail: 'В ведомство' }], agency: 'Соцзащита', timing: '10 дней', source_url: 'https://example.test', source_checked_at: '2026-11-26', date_end: '2020-01-01' };
    expect(normalizeMeasure(complete, true).error).toContain('истёкшим сроком');
  });
});

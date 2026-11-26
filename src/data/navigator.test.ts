import { describe, expect, it } from 'vitest';
import { getCatalogCards, getNavigatorCards, inferNavigatorTopic, NAVIGATOR_AUDIENCES } from './navigator';
import type { BenefitMeasure } from '../api/client';

describe('navigator demo routing', () => {
  it('includes applicants and both family groups in the first-release audience', () => {
    expect(NAVIGATOR_AUDIENCES.map((item) => item.id)).toEqual(['veteran', 'status-pending', 'family', 'bereaved-family']);
  });
  it('shows federal and selected regional cards only', () => {
    expect(getNavigatorCards('work', 'vladimir').map((card) => card.id)).toEqual(['work-federal', 'regional-vladimir']);
    expect(getNavigatorCards('work', 'kaluga').map((card) => card.id)).toEqual(['work-federal', 'regional-kaluga']);
    expect(getNavigatorCards('work', 'moscow').map((card) => card.id)).toEqual(['work-federal']);
  });

  it('separates construction routes by region and restricts conditional measures by audience', () => {
    expect(getNavigatorCards('house', 'vladimir', 'family').map((card) => card.id)).toEqual(['house-vladimir-multichild']);
    expect(getNavigatorCards('house', 'kaluga', 'bereaved-family').map((card) => card.id)).toEqual(['house-kaluga-land', 'house-kaluga-payment']);
    expect(getNavigatorCards('house', 'kaluga', 'family')).toEqual([]);
    expect(getNavigatorCards('business', 'vladimir', 'veteran').map((card) => card.id)).toEqual(['business-social-contract']);
    expect(getNavigatorCards('business', 'kaluga', 'bereaved-family')).toEqual([]);
  });

  it('keeps source and eligibility details on every real mechanism', () => {
    for (const card of [...getNavigatorCards('house', 'vladimir'), ...getNavigatorCards('house', 'kaluga'), ...getNavigatorCards('business', 'vladimir')]) {
      expect(card.source?.url).toMatch(/^https:\/\//);
      expect(card.eligibility).toBeTruthy();
      expect(card.documents).toBeTruthy();
      expect(card.where).toBeTruthy();
      expect(card.timing).toBeTruthy();
    }
  });

  it('maps a plain-language request to a supported topic', () => {
    expect(inferNavigatorTopic('Хочу найти подходящую работу')).toBe('work');
    expect(inferNavigatorTopic('Нужно переобучение')).toBe('education');
    expect(inferNavigatorTopic('Нужна реабилитация')).toBe('health');
    expect(inferNavigatorTopic('Хочу переехать')).toBe('housing');
    expect(inferNavigatorTopic('Какие выплаты?')).toBe('payments');
    expect(inferNavigatorTopic('Хочу построить свой дом')).toBe('house');
    expect(inferNavigatorTopic('Есть субсидия на строительство дома?')).toBe('house');
    expect(inferNavigatorTopic('Субсидия на постройку дома')).toBe('house');
    expect(inferNavigatorTopic('Хочу открыть своё дело')).toBe('business');
    expect(inferNavigatorTopic('Нужны деньги на бизнес')).toBe('business');
    expect(inferNavigatorTopic('Помогите')).toBeNull();
  });

  it('shows a published catalog card only to its declared audience and topic', () => {
    const measure = { id: 1, title: 'Лечение', topic: 'health', region_id: null, audiences: ['veteran'], summary: 'Описание', steps: [{ title: 'Обратиться', detail: 'В СФР' }], eligibility: 'Условия', documents: ['Заявление'], agency: 'СФР', timing: '2 дня', exclusions: '', source_url: 'https://sfr.gov.ru/', source_checked_at: '2026-11-26' } as BenefitMeasure;
    expect(getCatalogCards([measure], 'health', 'veteran')).toHaveLength(1);
    expect(getCatalogCards([measure], 'health', 'family')).toEqual([]);
    expect(getCatalogCards([measure], 'work', 'veteran')).toEqual([]);
  });
});

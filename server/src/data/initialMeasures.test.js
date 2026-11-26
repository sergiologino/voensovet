import { describe, expect, it } from 'vitest';
import { INITIAL_MEASURES } from './initialMeasures.js';
import { normalizeMeasure } from '../measures.js';

describe('initial benefit catalog', () => {
  it('contains ten unique, publishable, sourced measures for the pilot', () => {
    expect(INITIAL_MEASURES).toHaveLength(10);
    expect(new Set(INITIAL_MEASURES.map((item) => item.source_key)).size).toBe(10);
    for (const item of INITIAL_MEASURES) {
      expect(normalizeMeasure(item).error, item.source_key).toBeUndefined();
      expect(normalizeMeasure({ ...item, date_end: null }, true).error, item.source_key).toBeUndefined();
      expect(item.source_url).toMatch(/^https:\/\//);
      expect(item.source_checked_at).toBe('2026-11-26');
      if (item.scope === 'regional') expect(['vladimir', 'kaluga']).toContain(item.region_id);
    }
  });
});

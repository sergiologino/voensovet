import { describe, expect, it } from 'vitest';
import { SEO_BY_PAGE } from './routeSeo';

/** Должен совпадать с ключами `pages` и резолвом hash в `App.tsx`. */
const REQUIRED_PAGE_KEYS = [
  'welcome',
  'home',
  'help',
  'contract-service',
  'veteran',
  'family',
  'bereaved',
  'benefits',
  'complaints',
  'organizations',
  'return',
  'profile',
  'admin',
  'auth-callback',
] as const;

describe('SEO_BY_PAGE', () => {
  it('covers every route key used in App.tsx', () => {
    for (const key of REQUIRED_PAGE_KEYS) {
      const meta = SEO_BY_PAGE[key];
      expect(meta, `missing SEO for "${key}"`).toBeDefined();
      expect(meta!.title.length).toBeGreaterThan(0);
      expect(meta!.description.length).toBeGreaterThan(10);
      expect(meta!.keywords.length).toBeGreaterThan(5);
      expect(meta!.hash).toBe(key);
      if (meta!.noindex) {
        expect(['profile', 'admin', 'auth-callback']).toContain(key);
      }
    }
  });

  it('has no unexpected extra keys beyond documented routes', () => {
    const allowed = new Set<string>(REQUIRED_PAGE_KEYS);
    for (const key of Object.keys(SEO_BY_PAGE)) {
      expect(allowed.has(key), `unexpected SEO key "${key}"`).toBe(true);
    }
  });
});

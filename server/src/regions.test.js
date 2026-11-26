import { describe, expect, it } from 'vitest';
import { isEnabledRegionId, parseEnabledRegionIds } from './regions.js';

describe('pilot regions accepted by account API', () => {
  it('accepts the two pilot regions only', () => {
    const enabled = parseEnabledRegionIds('["vladimir","kaluga"]');
    expect(isEnabledRegionId('vladimir', enabled)).toBe(true);
    expect(isEnabledRegionId('kaluga', enabled)).toBe(true);
    expect(isEnabledRegionId('moscow', enabled)).toBe(false);
    expect(isEnabledRegionId(null, enabled)).toBe(false);
  });

  it('rejects malformed settings and removes duplicates', () => {
    expect(parseEnabledRegionIds('invalid')).toEqual(['vladimir', 'kaluga']);
    expect(parseEnabledRegionIds('["kaluga","kaluga"]')).toEqual(['kaluga']);
    expect(parseEnabledRegionIds('["bad-id"]')).toEqual(['vladimir', 'kaluga']);
  });
});

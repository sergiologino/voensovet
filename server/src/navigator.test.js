import { describe, expect, it } from 'vitest';
import { evaluateMeasure, normalizeNavigatorProfile, stepKey } from './navigator.js';

const profile = { audience: 'family', disability: 'II', relationship: 'spouse', children_count: 2, housing: 'rent' };
const measure = { audiences: ['family'], match_rules: { family_relationship: 'spouse', participant_disability: ['I', 'II'] } };

describe('navigator profile and matching', () => {
  it('validates a small, anonymous questionnaire', () => {
    expect(normalizeNavigatorProfile(profile).profile).toEqual(profile);
    expect(normalizeNavigatorProfile({ ...profile, children_count: '2' }).error).toBeTruthy();
    expect(normalizeNavigatorProfile({ ...profile, relationship: 'none' }).error).toBeTruthy();
    expect(normalizeNavigatorProfile({ ...profile, phone: '123' }).profile).not.toHaveProperty('phone');
  });

  it('uses verified constraints and explains unverified conditions', () => {
    expect(evaluateMeasure(measure, profile)?.reasons).toHaveLength(3);
    expect(evaluateMeasure(measure, { ...profile, relationship: 'parent' })).toBeNull();
    expect(evaluateMeasure(measure, { ...profile, disability: 'III' })).toBeNull();
    expect(evaluateMeasure(measure, { ...profile, disability: 'unknown' })?.checks).toContain('Уточните группу инвалидности участника');
    expect(evaluateMeasure({ audiences: ['veteran'], match_rules: {} }, profile)).toBeNull();
    expect(evaluateMeasure({ audiences: ['family'], match_rules: { min_children: 3 } }, profile)).toBeNull();
  });

  it('invalidates a step mark when its instruction or position changes', () => {
    const original = { title: 'Подать заявление', detail: 'В МФЦ' };
    expect(stepKey(original, 0)).toBe(stepKey(original, 0));
    expect(stepKey(original, 0)).not.toBe(stepKey({ ...original, detail: 'В соцзащиту' }, 0));
    expect(stepKey(original, 0)).not.toBe(stepKey(original, 1));
  });
});

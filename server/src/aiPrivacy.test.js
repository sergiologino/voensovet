import { describe, expect, it } from 'vitest';
import { buildSafeAiQuestion } from './aiPrivacy.js';

describe('AI privacy boundary', () => {
  it('uses a fixed general question without personal details', () => {
    const question = buildSafeAiQuestion('Я Иван Петров, телефон +7 900 111-22-33. Нужна работа');
    expect(question).toContain('найти работу');
    expect(question).not.toMatch(/Иван|Петров|900|111/);
  });

  it('does not echo unknown or sensitive requests', () => {
    const question = buildSafeAiQuestion('Мой адрес: улица Ленина, 15, паспорт 1234 567890');
    expect(question).toContain('узнать о доступных мерах');
    expect(question).not.toMatch(/Ленина|1234|567890/);
  });
});

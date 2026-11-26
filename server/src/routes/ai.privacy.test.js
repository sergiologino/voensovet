import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';

const mocks = vi.hoisted(() => ({
  query: vi.fn(async (sql) => sql.includes('SELECT key, value FROM admin_settings') ? { rows: [] } : { rows: [] }),
  get: vi.fn(async () => ({ data: [{ name: 'test-network', priority: 1 }] })),
  post: vi.fn(async () => ({ data: {
    status: 'success',
    response: { text: 'Общий ответ о мерах поддержки. Обратитесь к официальному источнику для проверки условий. ===ПОДРОБНО=== Подробный общий ответ.' },
  } })),
}));

vi.mock('../db/init.js', () => ({ pool: { query: mocks.query } }));
vi.mock('../middleware/auth.js', () => ({ authenticateToken: (req, _res, next) => {
  req.user = { id: 424242, full_name: 'Иван Петров', phone: '+7 900 111-22-33', region_id: 'vladimir' };
  next();
} }));
vi.mock('axios', () => ({ default: { get: mocks.get, post: mocks.post } }));

process.env.AI_SERVICE_API_KEY = 'test-only-key';
const { default: aiRoutes } = await import('./ai.js');
let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('AI request privacy', () => {
  it('keeps the original question locally and sends only a fixed topic with an unrelated ID', async () => {
    const original = 'Я Иван Петров, телефон +7 900 111-22-33. Нужна работа';
    const response = await fetch(`${baseUrl}/api/ai/process`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userQuery: original, regionName: 'Поддельный регион Иван Петров' }),
    });
    expect(response.status).toBe(200);
    expect(mocks.post).toHaveBeenCalledTimes(2);
    const outbound = JSON.stringify(mocks.post.mock.calls);
    expect(outbound).not.toMatch(/Иван|Петров|900|111-22|424242|Поддельный регион/);
    expect(outbound).toContain('Владимирская область');
    expect(mocks.query.mock.calls.find(([sql]) => sql.includes('INSERT INTO ai_requests'))?.[1]).toContain(original);
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';

const profiles = vi.hoisted(() => new Map());
const query = vi.hoisted(() => vi.fn(async (sql, values) => {
  if (sql.startsWith('SELECT audience')) return { rows: profiles.has(values[0]) ? [profiles.get(values[0])] : [] };
  if (sql.startsWith('INSERT INTO navigator_profiles')) {
    const profile = { audience: values[1], disability: values[2], relationship: values[3], children_count: values[4], housing: values[5] };
    profiles.set(values[0], profile);
    return { rows: [profile] };
  }
  if (sql.includes('FROM benefit_measures')) return { rows: [
    { id: 1, topic: 'business', scope: 'federal', audiences: ['family'], match_rules: { family_relationship: 'spouse', participant_disability: ['I', 'II'] } },
    { id: 2, topic: 'business', scope: 'regional', region_id: 'kaluga', audiences: ['family'], match_rules: {} },
  ] };
  return { rows: [] };
}));
vi.mock('../db/init.js', () => ({ pool: { query } }));
vi.mock('../middleware/auth.js', () => ({ authenticateToken: (req, res, next) => {
  const id = Number(req.headers['x-test-user']);
  if (!id) return res.status(401).json({ error: 'Требуется авторизация' });
  req.user = { id, region_id: id === 1 ? 'vladimir' : 'kaluga' };
  next();
} }));

const { navigatorRouter } = await import('./navigator.js');
let server;
let baseUrl;
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/navigator', navigatorRouter);
  server = await new Promise((resolve) => { const listening = app.listen(0, '127.0.0.1', () => resolve(listening)); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => { await new Promise((resolve) => server.close(resolve)); });

describe('navigator API', () => {
  it('isolates profiles and matches by authenticated account region', async () => {
    expect((await fetch(`${baseUrl}/api/navigator/profile`)).status).toBe(401);
    const body = { audience: 'family', disability: 'II', relationship: 'spouse', children_count: 1, housing: 'rent', phone: 'secret' };
    const saved = await fetch(`${baseUrl}/api/navigator/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-test-user': '1' }, body: JSON.stringify(body) });
    expect(saved.status).toBe(200);
    expect(await saved.json()).not.toHaveProperty('phone');
    const other = await fetch(`${baseUrl}/api/navigator/profile`, { headers: { 'x-test-user': '2' } });
    expect((await other.json()).profile).toBeNull();
    const matched = await fetch(`${baseUrl}/api/navigator/matches?topic=business&regionId=kaluga`, { headers: { 'x-test-user': '1' } });
    expect((await matched.json()).matches[0].reasons).toContain('Указанное родство соответствует условиям карточки');
    expect(query.mock.calls.at(-1)[1][0]).toBe('vladimir');
    expect(query.mock.calls.at(-1)[0]).toContain('date_end >= CURRENT_DATE');
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';

const state = vi.hoisted(() => ({ routes: new Map(), steps: new Map(), measure: {
  id: 8, title: 'Помощь с работой', topic: 'work', scope: 'regional', region_id: 'vladimir', locality: '',
  audiences: ['veteran'], match_rules: {}, status: 'published', date_end: null,
  steps: [{ title: 'Обратиться', detail: 'В кадровый центр' }, { title: 'Получить план', detail: 'Согласовать действия' }],
} }));
const query = vi.hoisted(() => vi.fn(async (sql, values = []) => {
  if (sql.startsWith('SELECT audience')) return { rows: [{ audience: 'veteran', disability: 'none', relationship: 'none', children_count: 0, housing: 'rent' }] };
  if (sql.startsWith('SELECT * FROM benefit_measures')) return { rows: state.measure.status === 'published' && values[1] === state.measure.region_id ? [state.measure] : [] };
  if (sql.startsWith('INSERT INTO navigator_routes')) {
    state.routes.set(`${values[0]}:${values[1]}`, { user_id: values[0], measure_id: Number(values[1]), selected_locality: values[2] });
    return { rows: [] };
  }
  if (sql.includes('FROM navigator_routes r JOIN benefit_measures m') && sql.startsWith('SELECT r.measure_id')) {
    return { rows: [...state.routes.values()].filter((route) => route.user_id === values[0]).map((route) => ({
      ...state.measure, ...route, catalog_available: state.measure.status === 'published' && state.measure.region_id === values[1], saved_at: '2026-11-26', updated_at: '2026-11-26',
    })) };
  }
  if (sql.startsWith('SELECT measure_id, step_key')) return { rows: [...state.steps.entries()].filter(([key]) => key.startsWith(`${values[0]}:`)).map(([key, step_key]) => ({ measure_id: Number(key.split(':')[1]), step_key })) };
  if (sql.startsWith('SELECT m.* FROM navigator_routes')) return { rows: state.routes.has(`${values[0]}:${values[1]}`) && values[2] === state.measure.region_id && state.measure.status === 'published' ? [state.measure] : [] };
  if (sql.startsWith('INSERT INTO navigator_completed_steps')) state.steps.set(`${values[0]}:${values[1]}:${values[2]}`, values[2]);
  if (sql.startsWith('DELETE FROM navigator_completed_steps')) state.steps.delete(`${values[0]}:${values[1]}:${values[2]}`);
  if (sql.startsWith('DELETE FROM navigator_routes')) {
    state.routes.delete(`${values[0]}:${values[1]}`);
    for (const key of state.steps.keys()) if (key.startsWith(`${values[0]}:${values[1]}:`)) state.steps.delete(key);
  }
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
  const app = express(); app.use(express.json()); app.use('/api/navigator', navigatorRouter);
  server = await new Promise((resolve) => { const listening = app.listen(0, '127.0.0.1', () => resolve(listening)); });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/navigator/progress`;
});
afterAll(async () => { await new Promise((resolve) => server.close(resolve)); });

describe('saved navigator routes', () => {
  it('isolates progress, validates steps, and invalidates changed instructions', async () => {
    expect((await fetch(baseUrl)).status).toBe(401);
    expect((await fetch(`${baseUrl}/8`, { method: 'POST', headers: { 'x-test-user': '2', 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(404);
    expect((await fetch(`${baseUrl}/8`, { method: 'POST', headers: { 'x-test-user': '1', 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(201);
    expect((await fetch(`${baseUrl}/8/steps/9`, { method: 'PUT', headers: { 'x-test-user': '1', 'Content-Type': 'application/json' }, body: '{"completed":true}' })).status).toBe(400);
    expect((await fetch(`${baseUrl}/8/steps/0`, { method: 'PUT', headers: { 'x-test-user': '2', 'Content-Type': 'application/json' }, body: '{"completed":true}' })).status).toBe(404);
    expect((await fetch(`${baseUrl}/8/steps/0`, { method: 'PUT', headers: { 'x-test-user': '1', 'Content-Type': 'application/json' }, body: '{"completed":true}' })).status).toBe(200);
    const own = await fetch(baseUrl, { headers: { 'x-test-user': '1' } });
    expect((await own.json()).routes[0].completed_step_indices).toEqual([0]);
    const other = await fetch(baseUrl, { headers: { 'x-test-user': '2' } });
    expect((await other.json()).routes).toEqual([]);
    state.measure.steps[0] = { title: 'Обратиться', detail: 'По новому адресу' };
    const changed = await fetch(baseUrl, { headers: { 'x-test-user': '1' } });
    expect((await changed.json()).routes[0].completed_step_indices).toEqual([]);
    state.measure.status = 'draft';
    const unavailable = await fetch(baseUrl, { headers: { 'x-test-user': '1' } });
    expect((await unavailable.json()).routes[0].available).toBe(false);
    expect((await fetch(`${baseUrl}/8/steps/0`, { method: 'PUT', headers: { 'x-test-user': '1', 'Content-Type': 'application/json' }, body: '{"completed":true}' })).status).toBe(404);
    expect((await fetch(`${baseUrl}/8`, { method: 'DELETE', headers: { 'x-test-user': '1' } })).status).toBe(200);
    const removed = await fetch(baseUrl, { headers: { 'x-test-user': '1' } });
    expect((await removed.json()).routes).toEqual([]);
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';

const state = vi.hoisted(() => ({ rows: [], nextId: 1 }));
const fields = ['title', 'topic', 'scope', 'region_id', 'locality', 'audiences', 'summary', 'eligibility', 'exclusions', 'documents', 'steps', 'agency', 'apply_url', 'timing', 'source_url', 'source_checked_at'];
const query = vi.hoisted(() => vi.fn());

query.mockImplementation(async (sql, values = []) => {
  if (sql.startsWith('INSERT INTO benefit_measures')) {
    const row = Object.fromEntries(fields.map((field, index) => [field, ['audiences', 'documents', 'steps'].includes(field) ? JSON.parse(values[index]) : values[index]]));
    row.id = state.nextId++;
    row.status = 'draft';
    state.rows.push(row);
    return { rows: [row] };
  }
  if (sql.startsWith('SELECT * FROM benefit_measures WHERE id')) return { rows: state.rows.filter((row) => row.id === Number(values[0])) };
  if (sql.includes("SET status = 'published'")) {
    const row = state.rows.find((item) => item.id === Number(values[1]));
    row.status = 'published';
    return { rows: [row] };
  }
  if (sql.startsWith('UPDATE benefit_measures SET title')) {
    const row = state.rows.find((item) => item.id === Number(values[values.length - 1]));
    if (!row) return { rows: [] };
    fields.forEach((field, index) => { row[field] = ['audiences', 'documents', 'steps'].includes(field) ? JSON.parse(values[index]) : values[index]; });
    row.status = 'draft';
    return { rows: [row] };
  }
  if (sql.includes("SET status = 'draft'")) {
    const row = state.rows.find((item) => item.id === Number(values[0]));
    row.status = 'draft';
    return { rows: [row] };
  }
  if (sql.startsWith('SELECT * FROM benefit_measures')) return { rows: state.rows };
  if (sql.includes("WHERE status = 'published'")) return { rows: state.rows.filter((row) => row.status === 'published' && (row.scope === 'federal' || row.region_id === values[0]) && (!row.locality || row.locality === values[1])) };
  return { rows: [] };
});

vi.mock('../db/init.js', () => ({ pool: { query } }));
vi.mock('../middleware/auth.js', () => ({
  authenticateToken: (req, _res, next) => { req.user = { id: 7, is_admin: req.headers['x-test-admin'] === 'yes' }; next(); },
  requireAdmin: (req, res, next) => req.user.is_admin ? next() : res.status(403).json({ error: 'Требуются права администратора' }),
}));

const { default: adminRoutes } = await import('./admin.js');
const { publicMeasuresRouter } = await import('./measures.js');
let server;
let baseUrl;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use('/api/measures', publicMeasuresRouter);
  server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

const measure = {
  title: 'Помощь с домом', topic: 'house', scope: 'regional', region_id: 'vladimir', locality: 'Владимир',
  audiences: ['veteran'], summary: 'Краткое описание', eligibility: 'Условия', exclusions: '',
  documents: ['Заявление'], steps: [{ title: 'Подать заявление', detail: 'В соцзащиту' }],
  agency: 'Соцзащита', apply_url: '', timing: '10 дней',
  source_url: 'https://example.test/official', source_checked_at: '2026-11-26',
};

describe('measure catalog API', () => {
  it('restricts editing, hides drafts, and publishes only reviewed complete data for the selected region', async () => {
    const forbidden = await fetch(`${baseUrl}/api/admin/measures`);
    expect(forbidden.status).toBe(403);

    const created = await fetch(`${baseUrl}/api/admin/measures`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-test-admin': 'yes' },
      body: JSON.stringify({ ...measure, summary: '' }),
    });
    expect(created.status).toBe(201);
    const { measure: draft } = await created.json();
    expect(draft.status).toBe('draft');

    const hidden = await fetch(`${baseUrl}/api/measures?regionId=vladimir`);
    expect((await hidden.json()).measures).toEqual([]);

    const invalidPublish = await fetch(`${baseUrl}/api/admin/measures/${draft.id}/publish`, {
      method: 'POST', headers: { 'x-test-admin': 'yes' },
    });
    expect(invalidPublish.status).toBe(400);

    state.rows[0].summary = measure.summary;
    const published = await fetch(`${baseUrl}/api/admin/measures/${draft.id}/publish`, {
      method: 'POST', headers: { 'x-test-admin': 'yes' },
    });
    expect(published.status).toBe(200);

    const noCity = await fetch(`${baseUrl}/api/measures?regionId=vladimir`);
    expect((await noCity.json()).measures).toEqual([]);
    const local = await fetch(`${baseUrl}/api/measures?regionId=vladimir&locality=${encodeURIComponent('Владимир')}`);
    expect((await local.json()).measures).toHaveLength(1);
    const other = await fetch(`${baseUrl}/api/measures?regionId=kaluga`);
    expect((await other.json()).measures).toEqual([]);

    const edited = await fetch(`${baseUrl}/api/admin/measures/${draft.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-test-admin': 'yes' },
      body: JSON.stringify({ ...measure, title: 'Уточнённая мера' }),
    });
    expect((await edited.json()).measure.status).toBe('draft');
    const hiddenAgain = await fetch(`${baseUrl}/api/measures?regionId=vladimir&locality=${encodeURIComponent('Владимир')}`);
    expect((await hiddenAgain.json()).measures).toEqual([]);
  });
});

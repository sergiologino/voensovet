import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import express from 'express';

const query = vi.hoisted(() => vi.fn(async (sql) => {
  if (sql.includes("key = 'enabled_regions'")) return { rows: [{ value: '["vladimir","kaluga"]' }] };
  if (sql.includes('SELECT id FROM users')) return { rows: [] };
  if (sql.includes('INSERT INTO users')) return { rows: [{ id: 1, phone: null, email: 'test@example.test', full_name: null, region_id: 'vladimir', is_admin: false }] };
  return { rows: [] };
}));

vi.mock('../db/init.js', () => ({ pool: { query } }));
vi.mock('../middleware/auth.js', () => ({ authenticateToken: (_req, _res, next) => next() }));

const { default: authRoutes } = await import('./auth.js');
let server;
let baseUrl;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret';
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('registration region', () => {
  it('stores the selected enabled region and returns it in the account', async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 'test@example.test', password: 'password123', captcha: '1', regionId: 'vladimir' }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.user.regionId).toBe('vladimir');
    expect(query.mock.calls.find(([sql]) => sql.includes('INSERT INTO users'))?.[1]).toContain('vladimir');
  });

  it('rejects a region hidden from the pilot', async () => {
    query.mockClear();
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 'other@example.test', password: 'password123', captcha: '1', regionId: 'moscow' }),
    });
    expect(response.status).toBe(400);
    expect(query.mock.calls.some(([sql]) => sql.includes('INSERT INTO users'))).toBe(false);
  });
});

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';

const query = vi.hoisted(() => vi.fn(async (sql) => {
  if (sql.includes('WHERE yandex_id')) return { rows: [{ id: 4, email: 'test@example.test', region_id: 'vladimir' }] };
  return { rows: [] };
}));
const post = vi.hoisted(() => vi.fn(async () => ({ data: { access_token: 'test-yandex-token' } })));
const get = vi.hoisted(() => vi.fn(async () => ({ data: { id: 'yandex-user-4' } })));
vi.mock('../db/init.js', () => ({ pool: { query } }));
vi.mock('../middleware/auth.js', () => ({ authenticateToken: (_req, _res, next) => next() }));
vi.mock('axios', () => ({ default: { post, get } }));

const { default: authRoutes } = await import('./auth.js');
let server;
let baseUrl;
beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret';
  const app = express(); app.use(express.json()); app.use('/api/auth', authRoutes);
  server = await new Promise((resolve) => { const listening = app.listen(0, '127.0.0.1', () => resolve(listening)); });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/auth/yandex`;
});
afterAll(async () => { await new Promise((resolve) => server.close(resolve)); });
beforeEach(() => {
  delete process.env.YANDEX_CLIENT_ID;
  delete process.env.YANDEX_CLIENT_SECRET;
  process.env.YANDEX_REDIRECT_URI = 'https://api.voensovet.ru/api/auth/yandex/callback';
  process.env.FRONTEND_URL = 'https://voensovet.ru';
  query.mockClear(); post.mockClear(); get.mockClear();
});

describe('Yandex OAuth', () => {
  it('does not send an empty client_id to Yandex', async () => {
    const response = await fetch(baseUrl, { redirect: 'manual' });
    expect(response.status).toBe(503);
    expect(response.headers.get('location')).toBeNull();
  });

  it('uses configured application id and callback address', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    const response = await fetch(baseUrl, { redirect: 'manual' });
    const location = new URL(response.headers.get('location'));
    expect(response.status).toBe(302);
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('redirect_uri')).toBe(process.env.YANDEX_REDIRECT_URI);
  });

  it('returns a successful login to the SPA hash route without a query token', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    const response = await fetch(`${baseUrl}/callback?code=test-code`, { redirect: 'manual' });
    const location = new URL(response.headers.get('location'));
    expect(response.status).toBe(302);
    expect(location.origin).toBe('https://voensovet.ru');
    expect(location.pathname).toBe('/');
    expect(location.search).toBe('');
    expect(location.hash).toMatch(/^#auth-callback\?token=/);
    expect(post.mock.calls[0][1]).toBeInstanceOf(URLSearchParams);
    expect(post.mock.calls[0][1].get('client_id')).toBe('client-id');
  });

  it('returns callback errors to the visible SPA route and logs a safe failure stage', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'invalid_grant' } } });
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const response = await fetch(`${baseUrl}/callback?code=bad-code`, { redirect: 'manual' });
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('https://voensovet.ru/#auth-callback?error=oauth_failed');
      expect(log).toHaveBeenCalledWith('Yandex OAuth failed', {
        stage: 'token_exchange', httpStatus: 400, providerCode: 'invalid_grant', databaseCode: undefined
      });
    } finally {
      log.mockRestore();
    }
  });
});

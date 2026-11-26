import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

const query = vi.hoisted(() => vi.fn(async (sql) => {
  if (sql.includes('WHERE yandex_id')) return { rows: [{ id: 4, email: 'test@example.test', region_id: 'vladimir' }] };
  return { rows: [] };
}));
const post = vi.hoisted(() => vi.fn(async () => ({ data: { access_token: 'test-yandex-token' } })));
const get = vi.hoisted(() => vi.fn(async () => ({ data: { id: 'yandex-user-4' } })));
vi.mock('../db/init.js', () => ({ pool: { query } }));
vi.mock('../middleware/auth.js', () => ({ authenticateToken: (req, _res, next) => {
  req.user = { id: 4, yandex_id: null };
  req.session = { id: 8 };
  next();
} }));
vi.mock('axios', () => ({ default: { post, get } }));

const { default: authRoutes } = await import('./auth.js');
let server;
let baseUrl;
beforeAll(async () => {
  process.env.JWT_SECRET = 'test-only-secret';
  const app = express(); app.use(express.json()); app.use(cookieParser()); app.use('/api/auth', authRoutes);
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

  it('does not silently merge a Yandex account with an existing email account', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    get.mockResolvedValueOnce({ data: { id: 'new-yandex-id', default_email: 'member@example.test' } });
    query.mockImplementationOnce(async () => ({ rows: [] }));
    query.mockImplementationOnce(async () => ({ rows: [{ id: 4 }] }));
    const response = await fetch(`${baseUrl}/callback?code=test-code`, { redirect: 'manual' });
    expect(response.headers.get('location')).toBe('https://voensovet.ru/#auth-callback?error=email_in_use');
    expect(query.mock.calls.some(([sql]) => sql.includes('INSERT INTO users'))).toBe(false);
  });

  it('links Yandex only after an authenticated start and matching state cookie', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    const start = await fetch(`${baseUrl}/link`, { method: 'POST' });
    expect(start.status).toBe(200);
    const { url } = await start.json();
    const state = new URL(url).searchParams.get('state');
    const cookie = start.headers.get('set-cookie').split(';')[0];
    expect(state).toMatch(/^[a-f0-9]{64}$/);
    query.mockImplementationOnce(async () => ({ rows: [{ user_id: 4, session_id: 8 }] }));
    query.mockImplementationOnce(async () => ({ rows: [{ user_id: 4 }] }));
    query.mockImplementationOnce(async () => ({ rows: [] }));
    query.mockImplementationOnce(async () => ({ rows: [{ id: 4 }] }));
    const callback = await fetch(`${baseUrl}/callback?code=test-code&state=${encodeURIComponent(state)}`, {
      redirect: 'manual', headers: { Cookie: cookie }
    });
    expect(callback.headers.get('location')).toBe('https://voensovet.ru/#profile?linked=yandex');
    expect(query.mock.calls.some(([sql]) => sql.includes('INSERT INTO users'))).toBe(false);
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE users SET yandex_id'))).toBe(true);
  });

  it('rejects a link callback without its state cookie', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    const callback = await fetch(`${baseUrl}/callback?code=test-code&state=forged`, { redirect: 'manual' });
    expect(callback.headers.get('location')).toBe('https://voensovet.ru/#auth-callback?error=link_failed');
    expect(post).not.toHaveBeenCalled();
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE users'))).toBe(false);
  });

  it('does not reassign a Yandex identity linked to another user', async () => {
    process.env.YANDEX_CLIENT_ID = 'client-id';
    process.env.YANDEX_CLIENT_SECRET = 'client-secret';
    const start = await fetch(`${baseUrl}/link`, { method: 'POST' });
    const state = new URL((await start.json()).url).searchParams.get('state');
    const cookie = start.headers.get('set-cookie').split(';')[0];
    query.mockImplementationOnce(async () => ({ rows: [{ user_id: 4, session_id: 8 }] }));
    query.mockImplementationOnce(async () => ({ rows: [{ user_id: 4 }] }));
    query.mockImplementationOnce(async () => ({ rows: [{ id: 99 }] }));
    const callback = await fetch(`${baseUrl}/callback?code=test-code&state=${encodeURIComponent(state)}`, {
      redirect: 'manual', headers: { Cookie: cookie }
    });
    expect(callback.headers.get('location')).toBe('https://voensovet.ru/#auth-callback?error=link_failed');
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE users'))).toBe(false);
  });

  it('reports an existing Yandex link after password login', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    query.mockImplementationOnce(async () => ({ rows: [{
      id: 4, email: 'member@example.test', password_hash: passwordHash,
      yandex_id: 'yandex-user-4', region_id: 'vladimir', is_admin: false
    }] }));
    const response = await fetch(baseUrl.replace('/yandex', '/login'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 'member@example.test', password: 'password123', captcha: '1' })
    });
    expect(response.status).toBe(200);
    expect((await response.json()).user.yandexLinked).toBe(true);
  });
});

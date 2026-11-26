// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({ refreshUser: async () => {} })
}));
vi.mock('./context/RegionContext', () => ({
  RegionProvider: ({ children }: { children: ReactNode }) => children
}));
vi.mock('./components/PageTracker', () => ({ PageTracker: () => null }));
vi.mock('./components/seo/AppRouteSEO', () => ({ AppRouteSEO: () => null }));
vi.mock('./pages/ProfilePage', () => ({ ProfilePage: () => <div>Профиль пользователя</div> }));

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  window.scrollTo = vi.fn();
});

afterEach(() => {
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/');
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe('OAuth callback on a fresh page load', () => {
  it('keeps the failure page visible instead of routing to home', async () => {
    window.history.replaceState({}, '', '/#auth-callback?error=oauth_failed');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<App />); });
    expect(container.textContent).toContain('Не удалось войти через Яндекс');
    expect(window.location.hash).toBe('#auth-callback?error=oauth_failed');
    await act(async () => { root.unmount(); });
  });

  it('explains an existing email account and points to password login', async () => {
    window.history.replaceState({}, '', '/#auth-callback?error=email_in_use');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<App />); });
    expect(container.textContent).toContain('Войдите по почте и привяжите Яндекс');
    expect(container.querySelector('button')?.textContent).toBe('Войти по почте');
    await act(async () => { container.querySelector('button')?.click(); });
    expect(container.querySelector('input[type="email"]')).not.toBeNull();
    await act(async () => { root.unmount(); });
  });

  it('opens the profile and removes the token from the URL after login', async () => {
    window.history.replaceState({}, '', '/#auth-callback?token=test-token');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<App />); });
    expect(window.localStorage.getItem('token')).toBe('test-token');
    expect(window.location.hash).toBe('#profile');
    await act(async () => { root.unmount(); });
  });
});

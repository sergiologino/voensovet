import { describe, expect, it } from 'vitest';
import { oauthTokenFromHash, pageFromHash } from './hashRoute';

describe('OAuth callback hash route', () => {
  it('opens the callback page and reads a token from the fragment', () => {
    const hash = '#auth-callback?token=header.payload.signature';
    expect(pageFromHash(hash)).toBe('auth-callback');
    expect(oauthTokenFromHash(hash)).toBe('header.payload.signature');
  });

  it('does not treat an error or empty fragment as a token', () => {
    expect(oauthTokenFromHash('#auth-callback?error=oauth_failed')).toBeNull();
    expect(pageFromHash('')).toBe('');
  });
});

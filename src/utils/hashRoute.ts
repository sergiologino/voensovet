export function pageFromHash(hash: string): string {
  return hash.replace(/^#/, '').split('?')[0];
}

export function oauthTokenFromHash(hash: string): string | null {
  return new URLSearchParams(hash.split('?')[1] || '').get('token');
}

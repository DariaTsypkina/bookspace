/** Build a URL-safe profile slug base from email local-part. */
export function slugBaseFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const cleaned = local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return cleaned.length > 0 ? cleaned : 'user';
}

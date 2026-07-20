export const SPOILERS_OK_COOKIE = 'spoilers_ok';
export const SPOILERS_OK_VALUE = '1';
export const SPOILERS_OK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function hasSpoilersConsent(cookieValue: string | undefined): boolean {
  return cookieValue === SPOILERS_OK_VALUE;
}

export function buildSpoilersOkCookie(): string {
  return `${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}; Path=/; Max-Age=${SPOILERS_OK_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export const CHARACTER_RELATION_LABELS = {
  FRIEND: 'Друг',
  ENEMY: 'Враг',
  FAMILY: 'Семья',
  RELATED: 'Связан',
} as const;

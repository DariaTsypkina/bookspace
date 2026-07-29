import {
  CharacterRelationType,
  SpoilersOkCookieValueSchema,
  SPOILERS_OK_COOKIE_NAME,
  SPOILERS_OK_COOKIE_VALUE,
  SPOILERS_OK_MAX_AGE_SECONDS,
} from '@bookspace/schemas';

export const SPOILERS_OK_COOKIE = SPOILERS_OK_COOKIE_NAME;
export const SPOILERS_OK_VALUE = SPOILERS_OK_COOKIE_VALUE;
export { SPOILERS_OK_MAX_AGE_SECONDS };

export function hasSpoilersConsent(cookieValue: string | undefined): boolean {
  return SpoilersOkCookieValueSchema.safeParse(cookieValue).success;
}

export function buildSpoilersOkCookie(): string {
  return `${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}; Path=/; Max-Age=${SPOILERS_OK_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export const CHARACTER_RELATION_LABELS: Record<CharacterRelationType, string> =
  {
    FRIEND: 'Друг',
    ENEMY: 'Враг',
    FAMILY: 'Семья',
    RELATED: 'Связан',
  };

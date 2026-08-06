import {
  CharacterRelationType,
  SpoilersOkCookieValueSchema,
  SPOILERS_OK_COOKIE_NAME,
  SPOILERS_OK_COOKIE_VALUE,
  SPOILERS_OK_MAX_AGE_SECONDS,
} from '@bookspace/schemas';

export const SPOILERS_OK_COOKIE = SPOILERS_OK_COOKIE_NAME;
export const SPOILERS_OK_VALUE = SPOILERS_OK_COOKIE_VALUE;
export const SPOILERS_OK_STORAGE_KEY = SPOILERS_OK_COOKIE_NAME;
export { SPOILERS_OK_MAX_AGE_SECONDS };

export function hasSpoilersConsent(cookieValue: string | undefined): boolean {
  return SpoilersOkCookieValueSchema.safeParse(cookieValue).success;
}

export type BuildSpoilersOkCookieOptions = {
  /** When true, append Secure (required/safer on HTTPS, esp. iOS WebKit). */
  secure?: boolean;
};

function detectSecureDefault(): boolean {
  return typeof location !== 'undefined' && location.protocol === 'https:';
}

export function buildSpoilersOkCookie(
  options: BuildSpoilersOkCookieOptions = {},
): string {
  const secure = options.secure ?? detectSecureDefault();
  const parts = [
    `${SPOILERS_OK_COOKIE}=${SPOILERS_OK_VALUE}`,
    'Path=/',
    `Max-Age=${SPOILERS_OK_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
  ];
  if (secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/** Robust parse of document.cookie (with/without spaces after `;`). */
export function parseSpoilersOkCookieValue(
  cookieHeader: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${SPOILERS_OK_COOKIE}=`)) {
      return trimmed.slice(SPOILERS_OK_COOKIE.length + 1);
    }
  }

  return undefined;
}

export function readSpoilersConsentFromStorage(
  storage: Storage | null | undefined,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    return hasSpoilersConsent(
      storage.getItem(SPOILERS_OK_STORAGE_KEY) ?? undefined,
    );
  } catch {
    return false;
  }
}

export type ClientSpoilersConsentSource = {
  cookieHeader: string;
  storage: Storage | null | undefined;
};

export function hasClientSpoilersConsent(
  source: ClientSpoilersConsentSource,
): boolean {
  if (hasSpoilersConsent(parseSpoilersOkCookieValue(source.cookieHeader))) {
    return true;
  }
  return readSpoilersConsentFromStorage(source.storage);
}

export type PersistSpoilersConsentOptions = {
  cookieSetter?: (cookie: string) => void;
  storage?: Storage | null;
  secure?: boolean;
};

/**
 * Persist spoilers consent to cookie and localStorage mirror.
 * Storage survives when iOS WebKit silently drops cookie writes.
 */
export function persistSpoilersConsent(
  options: PersistSpoilersConsentOptions = {},
): void {
  const cookie =
    typeof options.secure === 'boolean'
      ? buildSpoilersOkCookie({ secure: options.secure })
      : buildSpoilersOkCookie();

  const setCookie =
    options.cookieSetter ??
    ((value: string) => {
      if (typeof document !== 'undefined') {
        document.cookie = value;
      }
    });

  try {
    setCookie(cookie);
  } catch {
    /* cookie write can fail silently on some WebKit paths */
  }

  const storage =
    options.storage === undefined
      ? typeof localStorage !== 'undefined'
        ? localStorage
        : null
      : options.storage;

  if (!storage) {
    return;
  }

  try {
    storage.setItem(SPOILERS_OK_STORAGE_KEY, SPOILERS_OK_VALUE);
  } catch {
    /* private mode / quota — UI still uses React state */
  }
}

export const CHARACTER_RELATION_LABELS: Record<CharacterRelationType, string> =
  {
    FRIEND: 'Друг',
    ENEMY: 'Враг',
    FAMILY: 'Семья',
    RELATED: 'Связан',
  };

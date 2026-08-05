/**
 * User-facing error text: always Russian and understandable.
 * Map Nest/Zod English leftovers before showing in UI.
 */

export const FALLBACK_USER_MESSAGE = 'Произошла ошибка. Попробуйте снова.';

const NEST_DEFAULT_MESSAGES: Record<string, string> = {
  Unauthorized: 'Необходима авторизация',
  Forbidden: 'Недостаточно прав',
  'Not Found': 'Не найдено',
  'Bad Request': 'Некорректный запрос',
  Conflict: 'Конфликт данных',
  'Too Many Requests': 'Слишком много запросов. Попробуйте позже.',
  'Internal Server Error': 'Внутренняя ошибка сервера',
  'Service Unavailable': 'Сервис временно недоступен',
  'Gateway Timeout': 'Превышено время ожидания ответа',
};

const ZOD_SIMPLE_EN: Record<string, string> = {
  'Invalid email': 'Введите корректный email',
  'Invalid input': 'Проверьте корректность введённых данных',
  'Invalid string': 'Проверьте корректность введённых данных',
  Required: 'Заполните поле',
};

const TOO_SMALL_STRING_RE =
  /^Too small: expected string to have >=(\d+) characters$/i;
const TOO_BIG_STRING_RE =
  /^Too big: expected string to have <=(\d+) characters$/i;

function hasCyrillic(text: string): boolean {
  return /[А-Яа-яЁё]/.test(text);
}

function isMostlyLatinTechnical(text: string): boolean {
  if (hasCyrillic(text)) {
    return false;
  }
  // Allow short tokens like "email" in mixed copy; treat pure EN phrases as technical
  return /^[\x20-\x7E]+$/.test(text);
}

function mapSingleMessage(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return FALLBACK_USER_MESSAGE;
  }

  if (hasCyrillic(trimmed)) {
    return trimmed;
  }

  const nestMapped = NEST_DEFAULT_MESSAGES[trimmed];
  if (nestMapped) {
    return nestMapped;
  }

  const zodSimple = ZOD_SIMPLE_EN[trimmed];
  if (zodSimple) {
    return zodSimple;
  }

  const tooSmall = trimmed.match(TOO_SMALL_STRING_RE);
  if (tooSmall) {
    const min = Number(tooSmall[1]);
    if (min <= 1) {
      return 'Заполните поле';
    }
    return `Минимум ${min} символов`;
  }

  const tooBig = trimmed.match(TOO_BIG_STRING_RE);
  if (tooBig) {
    return `Максимум ${tooBig[1]} символов`;
  }

  if (/^Invalid email/i.test(trimmed)) {
    return 'Введите корректный email';
  }

  if (/^Invalid option:/i.test(trimmed) || /^Invalid enum/i.test(trimmed)) {
    return 'Выберите корректное значение';
  }

  if (/^Invalid/i.test(trimmed) || /^Expected /i.test(trimmed)) {
    return 'Проверьте корректность введённых данных';
  }

  if (/^Too small:/i.test(trimmed)) {
    return 'Значение слишком маленькое';
  }

  if (/^Too big:/i.test(trimmed)) {
    return 'Значение слишком большое';
  }

  if (isMostlyLatinTechnical(trimmed)) {
    return FALLBACK_USER_MESSAGE;
  }

  return trimmed;
}

/**
 * Translate a single API / Zod leftover message to RU for UI display.
 */
export function mapApiErrorMessage(message: string): string {
  if (!message.includes(',')) {
    return mapSingleMessage(message);
  }

  // Nest sometimes joins string[] with ", "
  const parts = message
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    return mapSingleMessage(message);
  }

  const mapped = parts.map(mapSingleMessage);
  // If every part fell back, return a single fallback (avoid repeating it)
  if (mapped.every((m) => m === FALLBACK_USER_MESSAGE)) {
    return FALLBACK_USER_MESSAGE;
  }
  return mapped.join(', ');
}

/**
 * Normalize any user-visible error string (forms, alerts, toasts).
 */
export function toUserFacingErrorMessage(
  raw: string | null | undefined,
): string {
  if (raw == null) {
    return FALLBACK_USER_MESSAGE;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return FALLBACK_USER_MESSAGE;
  }
  return mapApiErrorMessage(trimmed);
}

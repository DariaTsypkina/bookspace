import { describe, expect, it } from 'vitest';
import {
  FALLBACK_USER_MESSAGE,
  mapApiErrorMessage,
  toUserFacingErrorMessage,
} from './user-facing-errors';

describe('mapApiErrorMessage', () => {
  it('keeps already-Russian messages', () => {
    expect(mapApiErrorMessage('Неверный email или пароль')).toBe(
      'Неверный email или пароль',
    );
    expect(mapApiErrorMessage('Необходима авторизация')).toBe(
      'Необходима авторизация',
    );
  });

  it('maps Nest default English status phrases to Russian', () => {
    expect(mapApiErrorMessage('Unauthorized')).toBe('Необходима авторизация');
    expect(mapApiErrorMessage('Forbidden')).toBe('Недостаточно прав');
    expect(mapApiErrorMessage('Not Found')).toBe('Не найдено');
    expect(mapApiErrorMessage('Bad Request')).toBe('Некорректный запрос');
    expect(mapApiErrorMessage('Conflict')).toBe('Конфликт данных');
    expect(mapApiErrorMessage('Too Many Requests')).toBe(
      'Слишком много запросов. Попробуйте позже.',
    );
    expect(mapApiErrorMessage('Internal Server Error')).toBe(
      'Внутренняя ошибка сервера',
    );
  });

  it('maps common English Zod / validation leftovers to Russian', () => {
    expect(
      mapApiErrorMessage('Too small: expected string to have >=1 characters'),
    ).toBe('Заполните поле');
    expect(
      mapApiErrorMessage('Too small: expected string to have >=8 characters'),
    ).toBe('Минимум 8 символов');
    expect(mapApiErrorMessage('Invalid email')).toBe(
      'Введите корректный email',
    );
    expect(mapApiErrorMessage('Invalid input')).toBe(
      'Проверьте корректность введённых данных',
    );
    expect(mapApiErrorMessage('Required')).toBe('Заполните поле');
  });

  it('maps each item in comma-joined English messages', () => {
    expect(mapApiErrorMessage('Unauthorized, Forbidden')).toBe(
      'Необходима авторизация, Недостаточно прав',
    );
  });

  it('falls back for unknown Latin-only technical phrases', () => {
    expect(mapApiErrorMessage('Something went wrong')).toBe(
      FALLBACK_USER_MESSAGE,
    );
    expect(mapApiErrorMessage('Server error')).toBe(FALLBACK_USER_MESSAGE);
  });
});

describe('toUserFacingErrorMessage', () => {
  it('returns fallback for empty values', () => {
    expect(toUserFacingErrorMessage(undefined)).toBe(FALLBACK_USER_MESSAGE);
    expect(toUserFacingErrorMessage(null)).toBe(FALLBACK_USER_MESSAGE);
    expect(toUserFacingErrorMessage('')).toBe(FALLBACK_USER_MESSAGE);
    expect(toUserFacingErrorMessage('   ')).toBe(FALLBACK_USER_MESSAGE);
  });

  it('maps English Nest defaults when used as UI error text', () => {
    expect(toUserFacingErrorMessage('Unauthorized')).toBe(
      'Необходима авторизация',
    );
  });
});

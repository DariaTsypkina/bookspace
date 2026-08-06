import { describe, expect, it } from 'vitest';
import {
  formatUserBookRating,
  formatUserBookStatus,
  USER_BOOK_STATUS_LABELS,
} from './user-book-status';

describe('user-book-status labels (bd-cq7.1)', () => {
  it('maps all statuses to RU labels', () => {
    expect(USER_BOOK_STATUS_LABELS.WANT).toBe('Хочу прочитать');
    expect(USER_BOOK_STATUS_LABELS.READING).toBe('Читаю');
    expect(USER_BOOK_STATUS_LABELS.READ).toBe('Прочитано');
    expect(USER_BOOK_STATUS_LABELS.ABANDONED).toBe('Заброшено');
    expect(formatUserBookStatus('READ')).toBe('Прочитано');
  });

  it('formats rating 1–10 or без оценки', () => {
    expect(formatUserBookRating(7)).toBe('7/10');
    expect(formatUserBookRating(null)).toBe('без оценки');
    expect(formatUserBookRating(undefined)).toBe('без оценки');
  });
});

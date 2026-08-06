import type { UserBookStatus } from '@bookspace/schemas';

export const USER_BOOK_STATUS_LABELS: Record<UserBookStatus, string> = {
  WANT: 'Хочу прочитать',
  READING: 'Читаю',
  READ: 'Прочитано',
  ABANDONED: 'Заброшено',
};

export const USER_BOOK_STATUS_OPTIONS: UserBookStatus[] = [
  'WANT',
  'READING',
  'READ',
  'ABANDONED',
];

export function formatUserBookStatus(status: UserBookStatus): string {
  return USER_BOOK_STATUS_LABELS[status];
}

export function formatUserBookRating(
  rating: number | null | undefined,
): string {
  if (rating == null) {
    return 'без оценки';
  }
  return `${rating}/10`;
}

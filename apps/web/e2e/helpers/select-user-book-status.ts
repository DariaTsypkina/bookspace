import type { Locator, Page } from '@playwright/test';

/** RU labels from `lib/user-book-status` — Radix Select options use text, not value. */
const USER_BOOK_STATUS_LABELS = {
  WANT: 'Хочу прочитать',
  READING: 'Читаю',
  READ: 'Прочитано',
  ABANDONED: 'Заброшено',
} as const;

export type UserBookStatusKey = keyof typeof USER_BOOK_STATUS_LABELS;

/**
 * Choose a status in shadcn/Radix Select (bd-a12.2).
 * Options render in a portal — always click option on `page`.
 */
export async function selectUserBookStatus(
  page: Page,
  status: UserBookStatusKey,
  scope?: Locator,
) {
  const root = scope ?? page;
  await root.getByLabel('Статус книги').click();
  await page
    .getByRole('option', { name: USER_BOOK_STATUS_LABELS[status] })
    .click();
}

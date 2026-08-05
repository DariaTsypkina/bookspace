'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { UserBookResponse, UserBookStatus } from '@bookspace/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApiError, api } from '@/lib/http';
import {
  USER_BOOK_STATUS_LABELS,
  USER_BOOK_STATUS_OPTIONS,
  formatUserBookRating,
  formatUserBookStatus,
} from '@/lib/user-book-status';

type StatusFilter = UserBookStatus | 'ALL';

const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Все' },
  ...USER_BOOK_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: USER_BOOK_STATUS_LABELS[status],
  })),
];

type LibraryCollectionProps = {
  /** Bump to reload list after upsert elsewhere on the page. */
  reloadToken?: number;
};

export function LibraryCollection({ reloadToken = 0 }: LibraryCollectionProps) {
  const [items, setItems] = useState<UserBookResponse[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (statusFilter: StatusFilter) => {
    setLoading(true);
    setAuthRequired(false);
    setError(null);
    try {
      const path =
        statusFilter === 'ALL'
          ? '/api/me/library'
          : `/api/me/library?status=${encodeURIComponent(statusFilter)}`;
      const { data } = await api.get<{ items: UserBookResponse[] }>(path);
      setItems(data.items);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthRequired(true);
        setItems([]);
      } else {
        setError('Не удалось загрузить коллекцию');
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load(filter);
    });
  }, [load, filter, reloadToken]);

  if (authRequired) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Войдите
            </Link>
            , чтобы видеть свою коллекцию.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      <div
        role="group"
        aria-label="Фильтр по статусу"
        className="flex flex-wrap gap-2"
      >
        {FILTER_OPTIONS.map((option) => {
          const active = filter === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              aria-pressed={active}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      {error ? (
        <p role="status" className="text-[0.95rem] text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-[0.95rem] text-muted" role="status">
          Загрузка коллекции…
        </p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="px-4 py-3.5">
            <p className="text-[0.95rem] text-muted">
              В коллекции пока пусто. Добавьте книгу ниже или со страницы
              произведения.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul
          aria-label="Список книг"
          className="flex list-none flex-col gap-2 p-0"
        >
          {items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex flex-col gap-1 px-4 py-3 font-sans">
                  <Link
                    href={`/books/${encodeURIComponent(item.workSlug)}`}
                    className="text-[1.05rem] font-medium text-foreground no-underline underline-offset-2 hover:underline"
                  >
                    {item.titleRu}
                  </Link>
                  <p className="text-[0.9rem] text-muted">
                    {formatUserBookStatus(item.status)}
                    {' · '}
                    {formatUserBookRating(item.rating)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

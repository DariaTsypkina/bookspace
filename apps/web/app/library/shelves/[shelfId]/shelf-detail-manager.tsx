'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { ShelfResponse } from '@bookspace/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, api } from '@/lib/http';

export function ShelfDetailManager() {
  const params = useParams<{ shelfId: string }>();
  const shelfId = params.shelfId;
  const [shelf, setShelf] = useState<ShelfResponse | null>(null);
  const [workSlug, setWorkSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    if (!shelfId) return;
    setLoading(true);
    setAuthRequired(false);
    setNotFound(false);
    try {
      const { data } = await api.get<ShelfResponse>(
        `/api/me/shelves/${encodeURIComponent(shelfId)}`,
      );
      setShelf(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuthRequired(true);
        setShelf(null);
      } else if (error instanceof ApiError && error.status === 404) {
        setNotFound(true);
        setShelf(null);
      } else {
        setStatus({ kind: 'error', message: 'Не удалось загрузить полку' });
      }
    } finally {
      setLoading(false);
    }
  }, [shelfId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!shelfId || !workSlug.trim()) return;
    setStatus(null);
    try {
      const { data } = await api.post<ShelfResponse>(
        `/api/me/shelves/${encodeURIComponent(shelfId)}/items`,
        { workSlug: workSlug.trim() },
      );
      setShelf(data);
      setWorkSlug('');
      setStatus({ kind: 'success', message: 'Книга добавлена на полку' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setStatus({
          kind: 'error',
          message: 'Сначала добавьте книгу в коллекцию',
        });
        return;
      }
      if (error instanceof ApiError && error.status === 404) {
        setStatus({ kind: 'error', message: 'Произведение не найдено' });
        return;
      }
      setStatus({ kind: 'error', message: 'Не удалось добавить книгу' });
    }
  }

  async function handleRemove(itemWorkSlug: string) {
    if (!shelfId) return;
    setStatus(null);
    try {
      const { data } = await api.delete<ShelfResponse>(
        `/api/me/shelves/${encodeURIComponent(shelfId)}/items/${encodeURIComponent(itemWorkSlug)}`,
      );
      setShelf(data);
      setStatus({ kind: 'success', message: 'Книга убрана с полки' });
    } catch {
      setStatus({ kind: 'error', message: 'Не удалось убрать книгу' });
    }
  }

  if (authRequired) {
    return (
      <Card>
        <CardContent className="px-4 py-3.5 font-sans text-[0.95rem] text-muted">
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Войдите
          </Link>
          , чтобы открыть полку.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <p className="font-sans text-[0.95rem] text-muted">Загрузка…</p>;
  }

  if (notFound || !shelf) {
    return (
      <Card>
        <CardContent className="px-4 py-3.5 font-sans text-[0.95rem] text-muted">
          Полка не найдена.
        </CardContent>
      </Card>
    );
  }

  const items = shelf.items ?? [];

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-3.5 font-sans">
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {shelf.title}
          </h1>
          {shelf.description ? (
            <p className="text-[0.95rem] text-muted">{shelf.description}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <h2 className="text-[1.15rem] font-medium text-foreground">
            Добавить книгу
          </h2>
          <form className="flex flex-col gap-3" onSubmit={handleAdd}>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Слаг произведения
              <Input
                value={workSlug}
                onChange={(e) => setWorkSlug(e.target.value)}
                autoComplete="off"
                placeholder="garri-potter-filosofskiy-kamen"
              />
            </label>
            <Button type="submit">Добавить на полку</Button>
          </form>
          {status ? (
            <p
              role="status"
              className={
                status.kind === 'success'
                  ? 'text-[0.9rem] text-foreground'
                  : 'text-[0.9rem] text-[color:var(--error)]'
              }
            >
              {status.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <h2 className="text-[1.15rem] font-medium text-foreground">
            Книги на полке
          </h2>
          {items.length === 0 ? (
            <p className="text-[0.95rem] text-muted">
              На полке пока пусто. Добавьте книгу из коллекции.
            </p>
          ) : (
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Книги на полке"
            >
              {items.map((item) => (
                <li
                  key={item.workSlug}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <Link
                    href={`/books/${item.workSlug}`}
                    className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                  >
                    {item.titleRu}
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleRemove(item.workSlug)}
                  >
                    Убрать
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

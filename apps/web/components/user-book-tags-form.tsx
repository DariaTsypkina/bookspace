'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { TagResponse, UserBookResponse } from '@bookspace/schemas';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, api } from '@/lib/http';

type UserBookTagsFormProps = {
  workSlug: string;
};

export function UserBookTagsForm({ workSlug }: UserBookTagsFormProps) {
  const { user, status: authStatus } = useAuth();
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [hasUserBook, setHasUserBook] = useState(false);
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (authStatus === 'pending' || !user) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<{ item: UserBookResponse | null }>(
          `/api/me/library/works/${encodeURIComponent(workSlug)}`,
        );
        if (cancelled) return;
        if (data.item) {
          setHasUserBook(true);
          setTags(data.item.tags ?? []);
        } else {
          setHasUserBook(false);
          setTags([]);
        }
      } catch {
        if (!cancelled) {
          setHasUserBook(false);
          setTags([]);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus, user, workSlug]);

  if (authStatus === 'pending') {
    return (
      <section aria-label="Теги" className="flex flex-col gap-3 font-sans">
        <h2 className="text-[1.15rem] font-medium text-foreground">Теги</h2>
        <p className="text-sm text-muted" role="status">
          Загрузка…
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section aria-label="Теги" className="flex flex-col gap-3 font-sans">
        <h2 className="text-[1.15rem] font-medium text-foreground">Теги</h2>
        <p className="text-[0.95rem] text-muted">
          <Link href="/login" className="underline-offset-2 hover:underline">
            Войдите
          </Link>
          , чтобы назначить теги.
        </p>
      </section>
    );
  }

  async function handleAssign(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.post<UserBookResponse>(
        `/api/me/library/works/${encodeURIComponent(workSlug)}/tags`,
        { name: trimmed },
      );
      setHasUserBook(true);
      setTags(data.tags ?? []);
      setName('');
      setFeedback({ kind: 'success', message: 'Тег назначен' });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setFeedback({
            kind: 'error',
            message: 'Войдите, чтобы назначить тег',
          });
          return;
        }
        if (error.status === 400) {
          setFeedback({
            kind: 'error',
            message:
              error.message ||
              'Сначала сохраните статус книги в библиотеке, затем назначьте тег',
          });
          return;
        }
        setFeedback({
          kind: 'error',
          message: error.message || 'Не удалось назначить тег',
        });
        return;
      }
      setFeedback({ kind: 'error', message: 'Не удалось назначить тег' });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(tagId: string) {
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.delete<UserBookResponse>(
        `/api/me/library/works/${encodeURIComponent(workSlug)}/tags/${encodeURIComponent(tagId)}`,
      );
      setTags(data.tags ?? []);
      setFeedback({ kind: 'success', message: 'Тег снят' });
    } catch (error) {
      if (error instanceof ApiError) {
        setFeedback({
          kind: 'error',
          message: error.message || 'Не удалось снять тег',
        });
        return;
      }
      setFeedback({ kind: 'error', message: 'Не удалось снять тег' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Теги" className="flex flex-col gap-3 font-sans">
      <h2 className="text-[1.15rem] font-medium text-foreground">Теги</h2>
      {!loaded ? (
        <p className="text-sm text-muted" role="status">
          Загрузка…
        </p>
      ) : (
        <>
          {!hasUserBook ? (
            <p className="text-[0.95rem] text-muted">
              Сначала сохраните статус книги выше, затем назначьте тег.
            </p>
          ) : null}
          {tags.length > 0 ? (
            <ul
              className="flex list-none flex-wrap gap-2 p-0"
              aria-label="Назначенные теги"
            >
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center gap-1">
                  <span className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground">
                    {tag.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    disabled={busy}
                    aria-label={`Снять тег ${tag.name}`}
                    onClick={() => void handleRemove(tag.id)}
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          ) : hasUserBook ? (
            <p className="text-sm text-muted">Пока нет тегов.</p>
          ) : null}
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={handleAssign}
            noValidate
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor={`tag-name-${workSlug}`}
                className="text-sm font-normal text-muted"
              >
                Новый тег
              </label>
              <Input
                id={`tag-name-${workSlug}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                placeholder="например, фэнтези"
                aria-label="Название тега"
                disabled={busy}
                className="font-sans"
              />
            </div>
            <Button type="submit" disabled={busy || !name.trim()}>
              Назначить тег
            </Button>
          </form>
          {feedback ? (
            <p
              className={
                feedback.kind === 'success'
                  ? 'text-sm text-foreground'
                  : 'text-sm text-destructive'
              }
              role="status"
            >
              {feedback.message}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

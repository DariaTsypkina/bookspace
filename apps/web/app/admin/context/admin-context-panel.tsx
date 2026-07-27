'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  classifyContextForWork,
  extractContextForWork,
  fetchRecentContextReadings,
  formatPublishedAt,
  patchContextReading,
  rejectContextReading,
  unpublishContextReading,
  type AdminContextReadingItem,
} from '@/lib/admin-context';
import { cn } from '@/lib/utils';

const textareaClassName = cn(
  'flex min-h-[4.5rem] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors',
  'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export function AdminContextPanel() {
  const [items, setItems] = useState<AdminContextReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { whyText: string; importanceRank: string }>
  >({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRecentContextReadings();
      setItems(response.items);
      setDrafts(
        Object.fromEntries(
          response.items.map((item) => [
            item.id,
            {
              whyText: item.whyText,
              importanceRank: String(item.importanceRank),
            },
          ]),
        ),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить очередь',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadItems();
    });
  }, [loadItems]);

  async function handleSave(event: FormEvent, item: AdminContextReadingItem) {
    event.preventDefault();
    const draft = drafts[item.id];
    if (!draft) {
      return;
    }
    setBusyId(item.id);
    setError(null);
    try {
      await patchContextReading(item.id, {
        whyText: draft.whyText,
        importanceRank: Number(draft.importanceRank),
      });
      await loadItems();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Не удалось сохранить',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnpublish(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await unpublishContextReading(id);
      await loadItems();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось снять с публикации',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await rejectContextReading(id);
      await loadItems();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось отклонить',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleClassify(workId: string) {
    setBusyId(workId);
    setError(null);
    try {
      await classifyContextForWork(workId);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось запустить classify',
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleExtract(workId: string) {
    setBusyId(workId);
    setError(null);
    try {
      await extractContextForWork(workId, { async: true });
      await loadItems();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось запустить extract',
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-12 pt-8">
      <header>
        <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
          ContextReading
        </h1>
        <p className="mt-2 font-sans text-[0.95rem] text-muted">
          Очередь недавних auto-published записей для выборочной правки.
        </p>
      </header>

      {error ? (
        <p role="alert" className="font-sans text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p aria-live="polite" className="font-sans text-muted">
          Загрузка…
        </p>
      ) : items.length === 0 ? (
        <p className="font-sans text-muted">
          Нет свежих auto-published записей.
        </p>
      ) : (
        <ul className="flex list-none flex-col gap-6 p-0">
          {items.map((item) => {
            const draft = drafts[item.id];
            const isBusy = busyId === item.id || busyId === item.subjectWork.id;
            return (
              <li key={item.id}>
                <Card>
                  <CardContent className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-1.5 font-sans text-[0.95rem] leading-normal text-foreground">
                      <p>
                        Книга:{' '}
                        <Link href={`/books/${item.subjectWork.slug}`}>
                          {item.subjectWork.titleRu}
                        </Link>
                      </p>
                      <p>
                        Рекомендация:{' '}
                        <Link href={`/books/${item.recommendedWork.slug}`}>
                          {item.recommendedWork.titleRu}
                        </Link>
                      </p>
                      <p>Опубликовано: {formatPublishedAt(item.publishedAt)}</p>
                      {item.sourceUrl ? (
                        <p>
                          Источник:{' '}
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.sourceUrl}
                          </a>
                        </p>
                      ) : null}
                      {item.sourceSnippet ? (
                        <p className="text-sm text-muted">
                          {item.sourceSnippet}
                        </p>
                      ) : null}
                    </div>

                    <form
                      className="flex flex-col gap-2 font-sans"
                      onSubmit={(event) => void handleSave(event, item)}
                    >
                      <Label
                        htmlFor={`why-${item.id}`}
                        className="font-normal text-muted"
                      >
                        Почему (RU)
                      </Label>
                      <textarea
                        id={`why-${item.id}`}
                        className={textareaClassName}
                        value={draft?.whyText ?? item.whyText}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [item.id]: {
                              whyText: event.target.value,
                              importanceRank:
                                current[item.id]?.importanceRank ??
                                String(item.importanceRank),
                            },
                          }))
                        }
                        rows={3}
                        required
                      />

                      <Label
                        htmlFor={`rank-${item.id}`}
                        className="font-normal text-muted"
                      >
                        Ранг
                      </Label>
                      <Input
                        id={`rank-${item.id}`}
                        type="number"
                        min={1}
                        max={99}
                        value={
                          draft?.importanceRank ?? String(item.importanceRank)
                        }
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [item.id]: {
                              whyText:
                                current[item.id]?.whyText ?? item.whyText,
                              importanceRank: event.target.value,
                            },
                          }))
                        }
                        required
                      />

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button type="submit" disabled={isBusy}>
                          Сохранить
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void handleUnpublish(item.id)}
                        >
                          Снять с публикации
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void handleReject(item.id)}
                        >
                          Отклонить
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            void handleClassify(item.subjectWork.id)
                          }
                        >
                          Classify
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() =>
                            void handleExtract(item.subjectWork.id)
                          }
                        >
                          Extract
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
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
    <main className="admin-context-page">
      <header className="admin-context-header">
        <h1>ContextReading</h1>
        <p className="admin-context-lead">
          Очередь недавних auto-published записей для выборочной правки.
        </p>
      </header>

      {error ? (
        <p role="alert" className="admin-context-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p aria-live="polite">Загрузка…</p>
      ) : items.length === 0 ? (
        <p>Нет свежих auto-published записей.</p>
      ) : (
        <ul className="admin-context-list">
          {items.map((item) => {
            const draft = drafts[item.id];
            const isBusy = busyId === item.id || busyId === item.subjectWork.id;
            return (
              <li key={item.id} className="admin-context-card">
                <div className="admin-context-meta">
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
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                        {item.sourceUrl}
                      </a>
                    </p>
                  ) : null}
                  {item.sourceSnippet ? (
                    <p className="admin-context-snippet">
                      {item.sourceSnippet}
                    </p>
                  ) : null}
                </div>

                <form
                  className="admin-context-form"
                  onSubmit={(event) => void handleSave(event, item)}
                >
                  <label htmlFor={`why-${item.id}`}>Почему (RU)</label>
                  <textarea
                    id={`why-${item.id}`}
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

                  <label htmlFor={`rank-${item.id}`}>Ранг</label>
                  <input
                    id={`rank-${item.id}`}
                    type="number"
                    min={1}
                    max={99}
                    value={draft?.importanceRank ?? String(item.importanceRank)}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: {
                          whyText: current[item.id]?.whyText ?? item.whyText,
                          importanceRank: event.target.value,
                        },
                      }))
                    }
                    required
                  />

                  <div className="admin-context-actions">
                    <button type="submit" disabled={isBusy}>
                      Сохранить
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleUnpublish(item.id)}
                    >
                      Снять с публикации
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleReject(item.id)}
                    >
                      Отклонить
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleClassify(item.subjectWork.id)}
                    >
                      Classify
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleExtract(item.subjectWork.id)}
                    >
                      Extract
                    </button>
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AdminMatchQueueItem } from '@bookspace/schemas';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MATCH_QUEUE_KIND_LABELS,
  MATCH_QUEUE_STATUS_LABELS,
  createDraftFromMatchQueueItem,
  dismissAdminMatchQueueItem,
  fetchAdminMatchQueue,
  resolveAdminMatchQueueItem,
} from '@/lib/admin-match-queue';
import { cn } from '@/lib/utils';

type StatusFilter = AdminMatchQueueItem['status'] | 'OPEN';

function payloadTitle(item: AdminMatchQueueItem): string {
  const p = item.payload;
  const title =
    (typeof p.titleRu === 'string' && p.titleRu) ||
    (typeof p.title === 'string' && p.title) ||
    (typeof p.titleOrig === 'string' && p.titleOrig);
  return title?.trim() || 'Без названия';
}

function payloadYear(item: AdminMatchQueueItem): string {
  const p = item.payload;
  const year = p.yearFirst ?? p.year;
  if (typeof year === 'number') {
    return String(year);
  }
  return '—';
}

export function AdminMatchQueuePanel() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('id') ?? undefined;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('OPEN');
  const [items, setItems] = useState<AdminMatchQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? null);
  const [manualWorkId, setManualWorkId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminMatchQueue({
        status: statusFilter,
        id: focusId,
      });
      setItems(data);
      if (data.length > 0) {
        setSelectedId((prev) => {
          if (prev && data.some((i) => i.id === prev)) {
            return prev;
          }
          if (focusId && data.some((i) => i.id === focusId)) {
            return focusId;
          }
          return data[0]?.id ?? null;
        });
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить очередь',
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, focusId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  async function runAction(action: () => Promise<AdminMatchQueueItem>) {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      setItems((prev) => {
        if (statusFilter !== 'OPEN' && updated.status !== statusFilter) {
          return prev.filter((i) => i.id !== updated.id);
        }
        const rest = prev.filter((i) => i.id !== updated.id);
        return [updated, ...rest];
      });
      if (updated.status !== 'OPEN') {
        setSelectedId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось выполнить действие',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 font-sans">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Очередь не сматченного
          </h1>
          <p className="text-sm text-muted">
            Привязка Work, создание DRAFT или отклонение элемента MatchQueue.
          </p>
        </div>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          К дашборду
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">Элементы</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Статус</span>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger
                className="w-[10rem] font-sans"
                aria-label="Фильтр статуса"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Открытые</SelectItem>
                <SelectItem value="RESOLVED">Решённые</SelectItem>
                <SelectItem value="DISMISSED">Отклонённые</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || busy}
              onClick={() => void load()}
            >
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="text-sm text-muted">Загрузка…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted">
              Нет элементов с выбранным статусом.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors',
                      selectedId === item.id
                        ? 'bg-muted/40'
                        : 'hover:bg-muted/20',
                    )}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="font-medium text-foreground">
                      {payloadTitle(item)}
                    </span>
                    <span className="text-xs text-muted">
                      {MATCH_QUEUE_KIND_LABELS[item.kind]} ·{' '}
                      {MATCH_QUEUE_STATUS_LABELS[item.status]} ·{' '}
                      {item.id.slice(0, 8)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {selected ? (
        <Card aria-label="Детали элемента">
          <CardHeader>
            <CardTitle className="text-lg">{payloadTitle(selected)}</CardTitle>
            <p className="text-sm text-muted">
              {MATCH_QUEUE_KIND_LABELS[selected.kind]} · год{' '}
              {payloadYear(selected)}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/20 p-3 text-xs">
              {JSON.stringify(selected.payload, null, 2)}
            </pre>

            {selected.status === 'OPEN' ? (
              <>
                <section aria-label="Предложенные произведения">
                  <h2 className="mb-2 text-sm font-medium">
                    Предложенные Works
                  </h2>
                  {selected.suggestions.length === 0 ? (
                    <p className="text-sm text-muted">
                      Нет уверенных совпадений.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {selected.suggestions.map((s) => (
                        <li
                          key={s.workId}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium">{s.titleRu}</p>
                            <p className="text-xs text-muted">
                              score {(s.score * 100).toFixed(0)}% ·{' '}
                              {s.workId.slice(0, 8)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void runAction(() =>
                                resolveAdminMatchQueueItem(
                                  selected.id,
                                  s.workId,
                                ),
                              )
                            }
                          >
                            Привязать
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-label="Ручная привязка">
                  <h2 className="mb-2 text-sm font-medium">
                    Привязать по ID Work
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      className="max-w-md font-sans"
                      value={manualWorkId}
                      onChange={(e) => setManualWorkId(e.target.value)}
                      placeholder="UUID произведения"
                      aria-label="ID произведения"
                    />
                    <Button
                      type="button"
                      disabled={busy || !manualWorkId.trim()}
                      onClick={() =>
                        void runAction(() =>
                          resolveAdminMatchQueueItem(
                            selected.id,
                            manualWorkId.trim(),
                          ),
                        )
                      }
                    >
                      Привязать
                    </Button>
                  </div>
                </section>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      void runAction(() =>
                        createDraftFromMatchQueueItem(selected.id),
                      )
                    }
                  >
                    Создать DRAFT Work
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void runAction(() =>
                        dismissAdminMatchQueueItem(selected.id),
                      )
                    }
                  >
                    Отклонить
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">
                Элемент обработан
                {selected.resolvedWork
                  ? `: ${selected.resolvedWork.titleRu} (${selected.resolvedWork.status})`
                  : '.'}
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

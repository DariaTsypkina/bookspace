'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchAdminWork,
  fetchAdminWorks,
  mergeAdminWorks,
  statusLabel,
  type AdminWorkDetail,
  type AdminWorkListItem,
} from '@/lib/admin-catalog';
import { cn } from '@/lib/utils';

const IRREVERSIBLE_WARNING =
  'Операция необратима: дубликат получит статус MERGED, откат (un-merge) в MVP недоступен.';

function WorkSideCard({
  label,
  work,
  loading,
}: {
  label: string;
  work: AdminWorkDetail | null;
  loading: boolean;
}) {
  return (
    <Card className="min-h-[12rem]">
      <CardHeader className="pb-2">
        <CardTitle className="font-sans text-base font-normal text-muted">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 font-sans text-sm">
        {loading ? (
          <p className="text-muted">Загрузка…</p>
        ) : !work ? (
          <p className="text-muted">Выберите произведение</p>
        ) : (
          <>
            <p className="text-lg text-foreground">{work.titleRu}</p>
            {work.titleOrig ? (
              <p className="text-muted">{work.titleOrig}</p>
            ) : null}
            <p>
              Статус: {statusLabel(work.status)}
              {work.yearFirst ? ` · ${work.yearFirst}` : ''}
            </p>
            <p className="text-muted">slug: {work.slug}</p>
            <div>
              <p className="mb-1 text-muted">Авторы</p>
              {work.authors.length === 0 ? (
                <p>—</p>
              ) : (
                <ul className="list-inside list-disc">
                  {work.authors.map((a) => (
                    <li key={a.authorId}>{a.author.nameRu}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-1 text-muted">ExternalId</p>
              {work.externalIds.length === 0 ? (
                <p>—</p>
              ) : (
                <ul className="list-inside list-disc">
                  {work.externalIds.map((e) => (
                    <li key={e.id}>
                      {e.source}: {e.externalKey}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminWorkMergePanel() {
  const [works, setWorks] = useState<AdminWorkListItem[]>([]);
  const [canonicalId, setCanonicalId] = useState<string>('');
  const [duplicateId, setDuplicateId] = useState<string>('');
  const [canonical, setCanonical] = useState<AdminWorkDetail | null>(null);
  const [duplicate, setDuplicate] = useState<AdminWorkDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingCanon, setLoadingCanon] = useState(false);
  const [loadingDup, setLoadingDup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmMerge, setConfirmMerge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectEpoch, setSelectEpoch] = useState(0);

  const reloadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await fetchAdminWorks();
      setWorks(list.filter((w) => w.status !== 'MERGED' && !w.deletedAt));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить список произведений',
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void reloadList();
    });
  }, [reloadList]);

  useEffect(() => {
    if (!canonicalId) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingCanon(true);
      void fetchAdminWork(canonicalId)
        .then((w) => {
          if (!cancelled) setCanonical(w);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : 'Не удалось загрузить каноническое произведение',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingCanon(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [canonicalId]);

  useEffect(() => {
    if (!duplicateId) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoadingDup(true);
      void fetchAdminWork(duplicateId)
        .then((w) => {
          if (!cancelled) setDuplicate(w);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : 'Не удалось загрузить дубликат',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingDup(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [duplicateId]);

  async function runMerge() {
    if (!canonicalId || !duplicateId || canonicalId === duplicateId) {
      setError('Выберите два разных произведения');
      return;
    }
    if (!confirmMerge) {
      setConfirmMerge(true);
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await mergeAdminWorks(canonicalId, [duplicateId]);
      setSuccess(
        `Объединено: дубликат перенесён в канон (${result.mergedIds.length}). Операция записана в аудит.`,
      );
      setConfirmMerge(false);
      setDuplicateId('');
      setDuplicate(null);
      setSelectEpoch((n) => n + 1);
      await reloadList();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось выполнить merge',
      );
      setConfirmMerge(false);
    } finally {
      setBusy(false);
    }
  }

  const selectableForDup = works.filter((w) => w.id !== canonicalId);
  const selectableForCanon = works.filter((w) => w.id !== duplicateId);
  // Derive null when id cleared — avoid sync setState in effect (react-hooks/set-state-in-effect)
  const canonicalView = canonicalId ? canonical : null;
  const duplicateView = duplicateId ? duplicate : null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pb-12 pt-8">
      <header>
        <p className="mb-2 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'font-sans px-0',
            )}
          >
            ← Дашборд
          </Link>
          <Link
            href="/admin/catalog"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'font-sans px-0',
            )}
          >
            Каталог
          </Link>
        </p>
        <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
          Объединение дублей
        </h1>
        <p className="mt-2 font-sans text-[0.95rem] text-muted">
          Выберите каноническое произведение и дубликат. Сравнение side-by-side
          перед подтверждением.
        </p>
      </header>

      <div
        role="alert"
        className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3 font-sans text-sm text-destructive"
        data-testid="merge-irreversible-warning"
      >
        {IRREVERSIBLE_WARNING}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 font-sans text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          className="rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground"
          data-testid="merge-success"
        >
          {success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="font-sans text-sm text-muted"
            htmlFor="canonical-select"
          >
            Канон (останется)
          </label>
          <Select
            key={`canon-${selectEpoch}`}
            value={canonicalId || undefined}
            onValueChange={(v) => {
              setCanonicalId(v);
              setCanonical(null);
              setConfirmMerge(false);
              setSuccess(null);
            }}
            disabled={loadingList || busy}
          >
            <SelectTrigger
              id="canonical-select"
              className="font-sans"
              aria-label="Канон (останется)"
            >
              <SelectValue placeholder="Выберите канон" />
            </SelectTrigger>
            <SelectContent>
              {selectableForCanon.map((w) => (
                <SelectItem key={w.id} value={w.id} className="font-sans">
                  {w.titleRu} ({statusLabel(w.status)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            className="font-sans text-sm text-muted"
            htmlFor="duplicate-select"
          >
            Дубликат (будет объединён)
          </label>
          <Select
            key={`dup-${selectEpoch}`}
            value={duplicateId || undefined}
            onValueChange={(v) => {
              setDuplicateId(v);
              setDuplicate(null);
              setConfirmMerge(false);
              setSuccess(null);
            }}
            disabled={loadingList || busy}
          >
            <SelectTrigger
              id="duplicate-select"
              className="font-sans"
              aria-label="Дубликат (будет объединён)"
            >
              <SelectValue placeholder="Выберите дубликат" />
            </SelectTrigger>
            <SelectContent>
              {selectableForDup.map((w) => (
                <SelectItem key={w.id} value={w.id} className="font-sans">
                  {w.titleRu} ({statusLabel(w.status)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <WorkSideCard
          label="Канон"
          work={canonicalView}
          loading={Boolean(canonicalId) && loadingCanon}
        />
        <WorkSideCard
          label="Дубликат"
          work={duplicateView}
          loading={Boolean(duplicateId) && loadingDup}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={confirmMerge ? 'destructive' : 'default'}
          className="font-sans"
          disabled={busy || !canonicalId || !duplicateId}
          onClick={() => {
            void runMerge();
          }}
          data-testid="merge-confirm-button"
        >
          {confirmMerge
            ? 'Подтвердить необратимое объединение'
            : 'Объединить дубликат в канон'}
        </Button>
        {confirmMerge ? (
          <Button
            type="button"
            variant="ghost"
            className="font-sans"
            disabled={busy}
            onClick={() => setConfirmMerge(false)}
          >
            Отмена
          </Button>
        ) : null}
      </div>
    </main>
  );
}

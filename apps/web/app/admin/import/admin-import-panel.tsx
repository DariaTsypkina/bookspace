'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AdminCatalogImportStartSchema,
  assertCatalogImportStartPayload,
  type AdminCatalogImportStart,
} from '@bookspace/schemas';
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
  fetchAdminImportJob,
  IMPORT_SOURCE_LABELS,
  matchQueueHref,
  startAdminImportJob,
  type AdminImportJobStatus,
} from '@/lib/admin-import';
import { toUserFacingErrorMessage } from '@/lib/user-facing-errors';
import { cn } from '@/lib/utils';

const textareaClassName = cn(
  'flex min-h-[6rem] w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground shadow-sm transition-colors',
  'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

type ImportSource = AdminCatalogImportStart['source'];

function parseIsbnLines(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AdminImportPanel() {
  const [source, setSource] = useState<ImportSource>('isbn_list');
  const [query, setQuery] = useState('');
  const [isbnText, setIsbnText] = useState('');
  const [jsonText, setJsonText] = useState('[\n  { "titleRu": "" }\n]');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<AdminImportJobStatus | null>(null);

  const sourceHint = useMemo(() => {
    switch (source) {
      case 'openlibrary':
      case 'wikidata':
        return 'Stub-адаптер: один синтетический ряд с ExternalId (live HTTP — follow-up).';
      case 'isbn_list':
        return 'По одному ISBN на строку (или через запятую).';
      case 'json_upload':
        return 'JSON-массив объектов с titleRu / isbn13 / externalIds.';
      default:
        return '';
    }
  }, [source]);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      let payload: AdminCatalogImportStart;
      if (source === 'isbn_list') {
        payload = { source, isbns: parseIsbnLines(isbnText) };
      } else if (source === 'json_upload') {
        let rows: unknown[];
        try {
          const parsed = JSON.parse(jsonText) as unknown;
          if (!Array.isArray(parsed)) {
            throw new Error('JSON должен быть массивом');
          }
          rows = parsed;
        } catch {
          setError('Некорректный JSON: нужен массив объектов');
          return;
        }
        payload = { source, rows };
      } else {
        payload = { source, query: query.trim() };
      }

      const parsed = AdminCatalogImportStartSchema.safeParse(payload);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'Проверьте поля формы');
        return;
      }
      try {
        assertCatalogImportStartPayload(parsed.data);
      } catch (assertErr) {
        setError(
          assertErr instanceof Error
            ? assertErr.message
            : 'Проверьте поля формы',
        );
        return;
      }

      const started = await startAdminImportJob(parsed.data);
      const status = await fetchAdminImportJob(started.jobId);
      setJob(status);
    } catch (err) {
      setError(
        toUserFacingErrorMessage(
          err instanceof Error ? err.message : undefined,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-sans text-2xl font-normal text-foreground">
          Импорт каталога
        </h1>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: 'outline' }), 'font-sans')}
        >
          К дашборду
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-lg font-normal">
            Запуск job
          </CardTitle>
          <p className="mt-1 font-sans text-sm text-muted">{sourceHint}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-sm" htmlFor="import-source">
              Источник
            </label>
            <Select
              value={source}
              onValueChange={(value) => setSource(value as ImportSource)}
            >
              <SelectTrigger id="import-source" aria-label="Источник импорта">
                <SelectValue placeholder="Источник" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(IMPORT_SOURCE_LABELS) as ImportSource[]).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {IMPORT_SOURCE_LABELS[key]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {(source === 'openlibrary' || source === 'wikidata') && (
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm" htmlFor="import-query">
                Запрос
              </label>
              <Input
                id="import-query"
                className="font-sans"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Название или ключ"
                disabled={busy}
              />
            </div>
          )}

          {source === 'isbn_list' && (
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm" htmlFor="import-isbns">
                Список ISBN
              </label>
              <textarea
                id="import-isbns"
                className={textareaClassName}
                value={isbnText}
                onChange={(e) => setIsbnText(e.target.value)}
                placeholder={'9780306406157\n9780140449136'}
                disabled={busy}
              />
            </div>
          )}

          {source === 'json_upload' && (
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm" htmlFor="import-json">
                JSON
              </label>
              <textarea
                id="import-json"
                className={textareaClassName}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                disabled={busy}
              />
            </div>
          )}

          {error ? (
            <p className="font-sans text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            className="font-sans self-start"
            disabled={busy}
            onClick={() => void handleStart()}
          >
            {busy ? 'Запуск…' : 'Запустить'}
          </Button>
        </CardContent>
      </Card>

      {job ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-lg font-normal">
              Отчёт
            </CardTitle>
            <p className="mt-1 font-sans text-sm text-muted">
              Job id: <span className="tabular-nums">{job.jobId}</span> ·
              статус: {job.status}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {job.report ? (
              <dl className="grid grid-cols-2 gap-2 font-sans text-sm sm:grid-cols-5">
                <div>
                  <dt className="text-muted">created</dt>
                  <dd className="tabular-nums">{job.report.created}</dd>
                </div>
                <div>
                  <dt className="text-muted">updated</dt>
                  <dd className="tabular-nums">{job.report.updated}</dd>
                </div>
                <div>
                  <dt className="text-muted">queued</dt>
                  <dd className="tabular-nums">{job.report.queued}</dd>
                </div>
                <div>
                  <dt className="text-muted">drafts</dt>
                  <dd className="tabular-nums">{job.report.drafts}</dd>
                </div>
                <div>
                  <dt className="text-muted">failed</dt>
                  <dd className="tabular-nums">{job.report.failed}</dd>
                </div>
              </dl>
            ) : (
              <p className="font-sans text-sm text-muted">Отчёт ещё не готов</p>
            )}

            <div className="flex flex-col gap-2">
              <Link
                href={matchQueueHref()}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'font-sans w-fit',
                )}
              >
                Открыть MatchQueue
              </Link>
              {job.report?.matchQueueIds?.map((id) => (
                <Link
                  key={id}
                  href={matchQueueHref(id)}
                  className="font-sans text-sm text-accent underline-offset-2 hover:underline"
                >
                  MatchQueue {id}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

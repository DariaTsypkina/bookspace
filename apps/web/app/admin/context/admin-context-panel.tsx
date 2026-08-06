'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AdminContextPatchFormSchema,
  toAdminContextPatchInput,
  type AdminContextPatchForm,
} from '@bookspace/schemas';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { getFriendlyZodIssueMessage } from '@/lib/form-errors';
import { cn } from '@/lib/utils';

const textareaClassName = cn(
  'flex min-h-[4.5rem] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors',
  'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

type AdminContextReadingFormProps = {
  item: AdminContextReadingItem;
  busy: boolean;
  onBusyChange: (busyId: string | null) => void;
  onError: (message: string | null) => void;
  onReload: () => Promise<void>;
};

function AdminContextReadingForm({
  item,
  busy,
  onBusyChange,
  onError,
  onReload,
}: AdminContextReadingFormProps) {
  const form = useForm<AdminContextPatchForm>({
    resolver: zodResolver(AdminContextPatchFormSchema),
    defaultValues: {
      whyText: item.whyText,
      importanceRank: String(item.importanceRank),
    },
  });

  useEffect(() => {
    form.reset({
      whyText: item.whyText,
      importanceRank: String(item.importanceRank),
    });
  }, [form, item.importanceRank, item.whyText]);

  async function handleValidSubmit(values: AdminContextPatchForm) {
    onBusyChange(item.id);
    onError(null);
    try {
      await patchContextReading(item.id, toAdminContextPatchInput(values));
      await onReload();
    } catch (saveError) {
      onError(
        saveError instanceof Error ? saveError.message : 'Не удалось сохранить',
      );
    } finally {
      onBusyChange(null);
    }
  }

  function handleInvalidSubmit() {
    const result = AdminContextPatchFormSchema.safeParse(form.getValues());
    if (result.success) {
      return;
    }
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];
      if (fieldName === 'whyText' || fieldName === 'importanceRank') {
        form.setError(fieldName, {
          type: issue.code,
          message: getFriendlyZodIssueMessage(issue),
        });
      }
    }
  }

  async function handleUnpublish() {
    onBusyChange(item.id);
    onError(null);
    try {
      await unpublishContextReading(item.id);
      await onReload();
    } catch (actionError) {
      onError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось снять с публикации',
      );
    } finally {
      onBusyChange(null);
    }
  }

  async function handleReject() {
    onBusyChange(item.id);
    onError(null);
    try {
      await rejectContextReading(item.id);
      await onReload();
    } catch (actionError) {
      onError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось отклонить',
      );
    } finally {
      onBusyChange(null);
    }
  }

  async function handleClassify() {
    onBusyChange(item.subjectWork.id);
    onError(null);
    try {
      await classifyContextForWork(item.subjectWork.id);
    } catch (actionError) {
      onError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось запустить classify',
      );
    } finally {
      onBusyChange(null);
    }
  }

  async function handleExtract() {
    onBusyChange(item.subjectWork.id);
    onError(null);
    try {
      await extractContextForWork(item.subjectWork.id, { async: true });
      await onReload();
    } catch (actionError) {
      onError(
        actionError instanceof Error
          ? actionError.message
          : 'Не удалось запустить extract',
      );
    } finally {
      onBusyChange(null);
    }
  }

  return (
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
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                {item.sourceUrl}
              </a>
            </p>
          ) : null}
          {item.sourceSnippet ? (
            <p className="text-sm text-muted">{item.sourceSnippet}</p>
          ) : null}
        </div>

        <Form {...form}>
          <form
            className="flex flex-col gap-2 font-sans"
            onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
          >
            <FormField
              control={form.control}
              name="whyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal text-muted">
                    Почему (RU)
                  </FormLabel>
                  <FormControl>
                    <textarea
                      className={textareaClassName}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="importanceRank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal text-muted">Ранг</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={99} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                Сохранить
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void handleUnpublish()}
              >
                Снять с публикации
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void handleReject()}
              >
                Отклонить
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void handleClassify()}
              >
                Classify
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void handleExtract()}
              >
                Extract
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function AdminContextPanel() {
  const [items, setItems] = useState<AdminContextReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRecentContextReadings();
      setItems(response.items);
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
            const isBusy = busyId === item.id || busyId === item.subjectWork.id;
            return (
              <li key={item.id}>
                <AdminContextReadingForm
                  item={item}
                  busy={isBusy}
                  onBusyChange={setBusyId}
                  onError={setError}
                  onReload={loadItems}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

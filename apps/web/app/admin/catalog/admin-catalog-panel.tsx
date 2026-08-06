'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AdminExternalIdFormSchema,
  AdminWorkFormSchema,
  toAdminCreateWorkInput,
  toAdminUpdateWorkInput,
  type AdminExternalIdForm,
  type AdminWorkForm,
} from '@bookspace/schemas';
import { useForm } from 'react-hook-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  addAdminWorkExternalId,
  createAdminWork,
  deleteAdminWorkExternalId,
  fetchAdminWork,
  fetchAdminWorks,
  publishAdminWork,
  softDeleteAdminWork,
  statusLabel,
  updateAdminWork,
  type AdminWorkDetail,
  type AdminWorkListItem,
} from '@/lib/admin-catalog';
import { getFriendlyZodIssueMessage } from '@/lib/form-errors';
import { cn } from '@/lib/utils';

const EXTERNAL_SOURCE_LABELS: Record<string, string> = {
  openlibrary: 'Open Library',
  isbn: 'ISBN',
  wikidata: 'Wikidata',
  manual: 'Вручную',
};

const textareaClassName = cn(
  'flex min-h-[4.5rem] w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground shadow-sm transition-colors',
  'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

function CreateWorkForm({
  busy,
  onCreated,
  onError,
}: {
  busy: boolean;
  onCreated: (work: AdminWorkListItem) => void;
  onError: (message: string | null) => void;
}) {
  const form = useForm<AdminWorkForm>({
    resolver: zodResolver(AdminWorkFormSchema),
    defaultValues: {
      titleRu: '',
      titleOrig: '',
      yearFirst: '',
      descriptionRu: '',
      needsContext: 'UNKNOWN',
    },
  });

  async function onSubmit(values: AdminWorkForm) {
    onError(null);
    try {
      const work = await createAdminWork(toAdminCreateWorkInput(values));
      form.reset({
        titleRu: '',
        titleOrig: '',
        yearFirst: '',
        descriptionRu: '',
        needsContext: 'UNKNOWN',
      });
      onCreated(work);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Не удалось создать произведение',
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-lg font-normal">
          Новое произведение
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <FormField
              control={form.control}
              name="titleRu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (RU)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-sans"
                      aria-label="Название (RU)"
                      disabled={busy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleOrig"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Оригинальное название</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-sans"
                      aria-label="Оригинальное название"
                      disabled={busy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearFirst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Год первого издания</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-sans"
                      inputMode="numeric"
                      aria-label="Год первого издания"
                      disabled={busy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="needsContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нужен контекст</FormLabel>
                  <Select
                    value={field.value ?? 'UNKNOWN'}
                    onValueChange={field.onChange}
                    disabled={busy}
                  >
                    <FormControl>
                      <SelectTrigger aria-label="Нужен контекст">
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNKNOWN">Неизвестно</SelectItem>
                      <SelectItem value="YES">Да</SelectItem>
                      <SelectItem value="NO">Нет</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={busy} className="font-sans">
              Создать черновик
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function WorkEditor({
  workId,
  busy,
  onBusyChange,
  onError,
  onDeleted,
  onUpdated,
}: {
  workId: string;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const [detail, setDetail] = useState<AdminWorkDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<AdminWorkForm>({
    resolver: zodResolver(AdminWorkFormSchema),
    defaultValues: {
      titleRu: '',
      titleOrig: '',
      yearFirst: '',
      descriptionRu: '',
      needsContext: 'UNKNOWN',
    },
  });

  const externalForm = useForm<AdminExternalIdForm>({
    resolver: zodResolver(AdminExternalIdFormSchema),
    defaultValues: { source: 'openlibrary', externalKey: '' },
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    onError(null);
    try {
      const data = await fetchAdminWork(workId);
      setDetail(data);
      form.reset({
        titleRu: data.titleRu,
        titleOrig: data.titleOrig ?? '',
        yearFirst: data.yearFirst != null ? String(data.yearFirst) : '',
        descriptionRu: data.descriptionRu ?? '',
        needsContext: data.needsContext,
      });
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить произведение',
      );
    } finally {
      setLoading(false);
    }
  }, [form, onError, workId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function save(values: AdminWorkForm) {
    onBusyChange(true);
    onError(null);
    try {
      await updateAdminWork(workId, toAdminUpdateWorkInput(values));
      await load();
      onUpdated();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Не удалось сохранить изменения',
      );
    } finally {
      onBusyChange(false);
    }
  }

  async function publish() {
    onBusyChange(true);
    onError(null);
    try {
      await publishAdminWork(workId);
      await load();
      onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Не удалось опубликовать');
    } finally {
      onBusyChange(false);
    }
  }

  async function remove() {
    onBusyChange(true);
    onError(null);
    try {
      await softDeleteAdminWork(workId);
      onDeleted();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Не удалось удалить произведение',
      );
    } finally {
      onBusyChange(false);
      setConfirmDelete(false);
    }
  }

  async function addExternal(values: AdminExternalIdForm) {
    onBusyChange(true);
    onError(null);
    try {
      await addAdminWorkExternalId(workId, values);
      externalForm.reset({ source: 'openlibrary', externalKey: '' });
      await load();
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : 'Не удалось добавить внешний идентификатор',
      );
    } finally {
      onBusyChange(false);
    }
  }

  async function removeExternal(externalId: string) {
    onBusyChange(true);
    onError(null);
    try {
      await deleteAdminWorkExternalId(workId, externalId);
      await load();
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : 'Не удалось удалить внешний идентификатор',
      );
    } finally {
      onBusyChange(false);
    }
  }

  if (loading && !detail) {
    return <p className="font-sans text-sm text-muted">Загрузка…</p>;
  }

  if (!detail) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="font-sans text-lg font-normal">
              {detail.titleRu}
            </CardTitle>
            <p className="mt-1 font-sans text-sm text-muted">
              Статус: {statusLabel(detail.status)} · slug:{' '}
              <code className="text-xs">{detail.slug}</code>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.status === 'DRAFT' ? (
              <Button
                type="button"
                className="font-sans"
                disabled={busy}
                onClick={() => void publish()}
              >
                Опубликовать
              </Button>
            ) : null}
            {detail.status === 'PUBLISHED' ? (
              <Link
                href={`/books/${detail.slug}`}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'font-sans',
                )}
                target="_blank"
              >
                Открыть публично
              </Link>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              className="font-sans"
              disabled={busy}
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  return;
                }
                void remove();
              }}
            >
              {confirmDelete ? 'Подтвердить скрытие' : 'Скрыть (soft-delete)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(save, () => {
                const parsed = AdminWorkFormSchema.safeParse(form.getValues());
                if (!parsed.success) {
                  for (const issue of parsed.error.issues) {
                    const name = issue.path[0];
                    if (typeof name === 'string') {
                      form.setError(name as keyof AdminWorkForm, {
                        type: issue.code,
                        message: getFriendlyZodIssueMessage(issue),
                      });
                    }
                  }
                }
              })}
              noValidate
            >
              <FormField
                control={form.control}
                name="titleRu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название (RU)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="font-sans"
                        aria-label="Редактировать название"
                        disabled={busy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionRu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className={textareaClassName}
                        aria-label="Описание"
                        disabled={busy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="needsContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Нужен контекст</FormLabel>
                    <Select
                      value={field.value ?? 'UNKNOWN'}
                      onValueChange={field.onChange}
                      disabled={busy}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Редактировать нужен контекст">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UNKNOWN">Неизвестно</SelectItem>
                        <SelectItem value="YES">Да</SelectItem>
                        <SelectItem value="NO">Нет</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={busy} className="font-sans">
                Сохранить
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-lg font-normal">
            Внешние идентификаторы
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {detail.externalIds.length === 0 ? (
            <p className="font-sans text-sm text-muted">Пока нет</p>
          ) : (
            <ul className="flex flex-col gap-2" aria-label="Список ExternalId">
              {detail.externalIds.map((ext) => (
                <li
                  key={ext.id}
                  className="flex flex-wrap items-center justify-between gap-2 font-sans text-sm"
                >
                  <span>
                    {EXTERNAL_SOURCE_LABELS[ext.source] ?? ext.source}:{' '}
                    <code>{ext.externalKey}</code>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="font-sans"
                    disabled={busy}
                    onClick={() => void removeExternal(ext.id)}
                  >
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Form {...externalForm}>
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={externalForm.handleSubmit(addExternal)}
              noValidate
            >
              <FormField
                control={externalForm.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="min-w-[10rem] flex-1">
                    <FormLabel>Источник</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={busy}
                    >
                      <FormControl>
                        <SelectTrigger aria-label="Источник ExternalId">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(EXTERNAL_SOURCE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={externalForm.control}
                name="externalKey"
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormLabel>Ключ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="font-sans"
                        aria-label="Ключ ExternalId"
                        disabled={busy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={busy} className="font-sans">
                Добавить
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminCatalogPanel() {
  const [works, setWorks] = useState<AdminWorkListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const reloadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const items = await fetchAdminWorks();
      setWorks(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить список',
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12 pt-8">
      <header>
        <p className="mb-2">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'font-sans px-0',
            )}
          >
            ← Дашборд
          </Link>
        </p>
        <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
          Каталог
        </h1>
        <p className="mt-2 font-sans text-[0.95rem] text-muted">
          Создание и публикация произведений, внешние идентификаторы,
          soft-delete.
        </p>
        <p className="mt-3">
          <Link
            href="/admin/catalog/merge"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'font-sans',
            )}
          >
            Объединить дубли
          </Link>
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 font-sans text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <CreateWorkForm
        busy={busy}
        onError={setError}
        onCreated={(work) => {
          setSelectedId(work.id);
          void reloadList();
        }}
      />

      <section aria-label="Список произведений" className="flex flex-col gap-3">
        <h2 className="font-sans text-lg font-normal text-foreground">
          Произведения
        </h2>
        {loadingList ? (
          <p className="font-sans text-sm text-muted">Загрузка списка…</p>
        ) : works.length === 0 ? (
          <p className="font-sans text-sm text-muted">Пока пусто</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {works.map((work) => (
              <li key={work.id}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-md border border-border bg-surface px-3 py-2 text-left font-sans text-sm transition-colors',
                    selectedId === work.id
                      ? 'border-accent ring-1 ring-accent'
                      : 'hover:border-accent',
                  )}
                  onClick={() => setSelectedId(work.id)}
                >
                  <span className="block text-foreground">{work.titleRu}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {statusLabel(work.status)} · {work.slug}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedId ? (
        <section aria-label="Редактирование произведения">
          <WorkEditor
            key={selectedId}
            workId={selectedId}
            busy={busy}
            onBusyChange={setBusy}
            onError={setError}
            onDeleted={() => {
              setSelectedId(null);
              void reloadList();
            }}
            onUpdated={() => {
              void reloadList();
            }}
          />
        </section>
      ) : null}
    </main>
  );
}

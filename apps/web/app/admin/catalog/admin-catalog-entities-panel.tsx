'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AdminCatalogEntityFormSchema,
  toAdminCreateCharacterInput,
  toAdminCreatePlaceInput,
  toAdminCreateSeriesInput,
  toAdminCreateWorldInput,
  toAdminUpdateCharacterInput,
  toAdminUpdatePlaceInput,
  toAdminUpdateSeriesInput,
  toAdminUpdateWorldInput,
  type AdminCatalogEntityForm,
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
  createAdminCharacter,
  createAdminPlace,
  createAdminSeries,
  createAdminWorld,
  entityStatusLabel,
  fetchAdminCatalogEntities,
  fetchAdminCatalogEntity,
  publishAdminCatalogEntity,
  publicPathForEntity,
  softDeleteAdminCatalogEntity,
  updateAdminCharacter,
  updateAdminPlace,
  updateAdminSeries,
  updateAdminWorld,
  type AdminCatalogEntityListItem,
  type CatalogEntityKind,
} from '@/lib/admin-catalog-entities';
import { cn } from '@/lib/utils';

const textareaClassName = cn(
  'flex min-h-[4.5rem] w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground shadow-sm transition-colors',
  'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const KIND_META: Record<
  CatalogEntityKind,
  { title: string; singular: string; listLabel: string }
> = {
  series: {
    title: 'Серии',
    singular: 'серию',
    listLabel: 'Список серий',
  },
  characters: {
    title: 'Персонажи',
    singular: 'персонажа',
    listLabel: 'Список персонажей',
  },
  worlds: {
    title: 'Миры',
    singular: 'мир',
    listLabel: 'Список миров',
  },
  places: {
    title: 'Локации',
    singular: 'локацию',
    listLabel: 'Список локаций',
  },
};

async function createByKind(
  kind: CatalogEntityKind,
  form: AdminCatalogEntityForm,
) {
  switch (kind) {
    case 'series':
      return createAdminSeries(toAdminCreateSeriesInput(form));
    case 'characters':
      return createAdminCharacter(toAdminCreateCharacterInput(form));
    case 'worlds':
      return createAdminWorld(toAdminCreateWorldInput(form));
    case 'places':
      return createAdminPlace(toAdminCreatePlaceInput(form));
  }
}

async function updateByKind(
  kind: CatalogEntityKind,
  id: string,
  form: AdminCatalogEntityForm,
) {
  switch (kind) {
    case 'series':
      return updateAdminSeries(id, toAdminUpdateSeriesInput(form));
    case 'characters':
      return updateAdminCharacter(id, toAdminUpdateCharacterInput(form));
    case 'worlds':
      return updateAdminWorld(id, toAdminUpdateWorldInput(form));
    case 'places':
      return updateAdminPlace(id, toAdminUpdatePlaceInput(form));
  }
}

function CreateEntityForm({
  kind,
  worlds,
  busy,
  onCreated,
  onError,
}: {
  kind: CatalogEntityKind;
  worlds: AdminCatalogEntityListItem[];
  busy: boolean;
  onCreated: (item: AdminCatalogEntityListItem) => void;
  onError: (message: string | null) => void;
}) {
  const meta = KIND_META[kind];
  const form = useForm<AdminCatalogEntityForm>({
    resolver: zodResolver(AdminCatalogEntityFormSchema),
    defaultValues: {
      nameRu: '',
      nameOrig: '',
      descriptionRu: '',
      worldId: '',
    },
  });

  async function onSubmit(values: AdminCatalogEntityForm) {
    onError(null);
    try {
      const item = await createByKind(kind, values);
      form.reset({
        nameRu: '',
        nameOrig: '',
        descriptionRu: '',
        worldId: '',
      });
      onCreated(item);
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : `Не удалось создать ${meta.singular}`,
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-base font-normal">
          Новая сущность
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="nameRu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (RU)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-sans"
                      disabled={busy}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameOrig"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (ориг.)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-sans"
                      disabled={busy}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {kind === 'worlds' ? (
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
                        disabled={busy}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            {kind === 'places' ? (
              <FormField
                control={form.control}
                name="worldId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Мир (необязательно)</FormLabel>
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) =>
                        field.onChange(v === '__none__' ? '' : v)
                      }
                      disabled={busy}
                    >
                      <FormControl>
                        <SelectTrigger className="font-sans">
                          <SelectValue placeholder="Без мира" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Без мира</SelectItem>
                        {worlds.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.nameRu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <Button type="submit" disabled={busy} className="font-sans w-fit">
              Создать черновик
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function EntityEditor({
  kind,
  entityId,
  worlds,
  busy,
  onBusyChange,
  onError,
  onDeleted,
  onUpdated,
}: {
  kind: CatalogEntityKind;
  entityId: string;
  worlds: AdminCatalogEntityListItem[];
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const [item, setItem] = useState<AdminCatalogEntityListItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<AdminCatalogEntityForm>({
    resolver: zodResolver(AdminCatalogEntityFormSchema),
    defaultValues: {
      nameRu: '',
      nameOrig: '',
      descriptionRu: '',
      worldId: '',
    },
  });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminCatalogEntity(kind, entityId);
      setItem(data);
      form.reset({
        nameRu: data.nameRu,
        nameOrig: data.nameOrig ?? '',
        descriptionRu: data.descriptionRu ?? '',
        worldId: data.worldId ?? '',
      });
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Не удалось загрузить сущность',
      );
    } finally {
      setLoading(false);
    }
  }, [kind, entityId, form, onError]);

  useEffect(() => {
    queueMicrotask(() => {
      void reload();
    });
  }, [reload]);

  async function onSave(values: AdminCatalogEntityForm) {
    onError(null);
    onBusyChange(true);
    try {
      await updateByKind(kind, entityId, values);
      await reload();
      onUpdated();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Не удалось сохранить изменения',
      );
    } finally {
      onBusyChange(false);
    }
  }

  async function onPublish() {
    onError(null);
    onBusyChange(true);
    try {
      await publishAdminCatalogEntity(kind, entityId);
      await reload();
      onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Не удалось опубликовать');
    } finally {
      onBusyChange(false);
    }
  }

  async function onSoftDelete() {
    onError(null);
    onBusyChange(true);
    try {
      await softDeleteAdminCatalogEntity(kind, entityId);
      onDeleted();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Не удалось скрыть');
    } finally {
      onBusyChange(false);
      setConfirmDelete(false);
    }
  }

  if (loading || !item) {
    return <p className="font-sans text-sm text-muted">Загрузка карточки…</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-base font-normal">
          {item.nameRu}
        </CardTitle>
        <p className="font-sans text-sm text-muted">
          Статус: {entityStatusLabel(item.status)} · {item.slug}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSave)}
          >
            <FormField
              control={form.control}
              name="nameRu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (RU)</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-sans" disabled={busy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameOrig"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (ориг.)</FormLabel>
                  <FormControl>
                    <Input {...field} className="font-sans" disabled={busy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {kind === 'worlds' ? (
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
                        disabled={busy}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            {kind === 'places' ? (
              <FormField
                control={form.control}
                name="worldId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Мир</FormLabel>
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) =>
                        field.onChange(v === '__none__' ? '' : v)
                      }
                      disabled={busy}
                    >
                      <FormControl>
                        <SelectTrigger className="font-sans">
                          <SelectValue placeholder="Без мира" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Без мира</SelectItem>
                        {worlds.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.nameRu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy} className="font-sans">
                Сохранить
              </Button>
              {item.status === 'DRAFT' ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  className="font-sans"
                  onClick={() => void onPublish()}
                >
                  Опубликовать
                </Button>
              ) : null}
              {item.status === 'PUBLISHED' ? (
                <Link
                  href={publicPathForEntity(kind, item.slug)}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'default' }),
                    'font-sans',
                  )}
                >
                  Открыть публично
                </Link>
              ) : null}
              {!confirmDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  className="font-sans"
                  onClick={() => setConfirmDelete(true)}
                >
                  Скрыть (soft-delete)
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  className="font-sans"
                  onClick={() => void onSoftDelete()}
                >
                  Подтвердить скрытие
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function AdminCatalogEntitiesPanel({
  kind,
}: {
  kind: CatalogEntityKind;
}) {
  const meta = KIND_META[kind];
  const [items, setItems] = useState<AdminCatalogEntityListItem[]>([]);
  const [worlds, setWorlds] = useState<AdminCatalogEntityListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const reloadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await fetchAdminCatalogEntities(kind);
      setItems(list);
      if (kind === 'places') {
        const worldList = await fetchAdminCatalogEntities('worlds');
        setWorlds(worldList);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить список',
      );
    } finally {
      setLoadingList(false);
    }
  }, [kind]);

  useEffect(() => {
    setSelectedId(null);
    queueMicrotask(() => {
      void reloadList();
    });
  }, [reloadList]);

  return (
    <div className="flex flex-col gap-8">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 font-sans text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <CreateEntityForm
        kind={kind}
        worlds={worlds}
        busy={busy}
        onError={setError}
        onCreated={(item) => {
          setSelectedId(item.id);
          void reloadList();
        }}
      />

      <section aria-label={meta.listLabel} className="flex flex-col gap-3">
        <h2 className="font-sans text-lg font-normal text-foreground">
          {meta.title}
        </h2>
        {loadingList ? (
          <p className="font-sans text-sm text-muted">Загрузка списка…</p>
        ) : items.length === 0 ? (
          <p className="font-sans text-sm text-muted">Пока пусто</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-md border border-border bg-surface px-3 py-2 text-left font-sans text-sm transition-colors',
                    selectedId === row.id
                      ? 'border-accent ring-1 ring-accent'
                      : 'hover:border-accent',
                  )}
                  onClick={() => setSelectedId(row.id)}
                >
                  <span className="block text-foreground">{row.nameRu}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {entityStatusLabel(row.status)} · {row.slug}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedId ? (
        <section aria-label={`Редактирование: ${meta.title}`}>
          <EntityEditor
            key={`${kind}-${selectedId}`}
            kind={kind}
            entityId={selectedId}
            worlds={worlds}
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
    </div>
  );
}

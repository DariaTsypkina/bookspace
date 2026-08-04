'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateShelfInputSchema, type ShelfResponse } from '@bookspace/schemas';
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
import { ApiError, api } from '@/lib/http';

type CreateShelfFormValues = {
  title: string;
  description?: string;
};

export function ShelvesManager() {
  const [shelves, setShelves] = useState<ShelfResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [status, setStatus] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  const form = useForm<CreateShelfFormValues>({
    resolver: zodResolver(CreateShelfInputSchema),
    defaultValues: { title: '', description: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setAuthRequired(false);
    try {
      const { data } = await api.get<{ shelves: ShelfResponse[] }>(
        '/api/me/shelves',
      );
      setShelves(data.shelves);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuthRequired(true);
        setShelves([]);
      } else {
        setStatus({
          kind: 'error',
          message: 'Не удалось загрузить полки',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(values: CreateShelfFormValues) {
    setStatus(null);
    try {
      await api.post('/api/me/shelves', {
        title: values.title,
        description: values.description?.trim() || undefined,
      });
      form.reset({ title: '', description: '' });
      setStatus({ kind: 'success', message: 'Полка создана' });
      await load();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuthRequired(true);
        setStatus({
          kind: 'error',
          message: 'Войдите, чтобы управлять полками',
        });
        return;
      }
      setStatus({ kind: 'error', message: 'Не удалось создать полку' });
    }
  }

  async function handleDelete(shelfId: string) {
    setStatus(null);
    try {
      await api.delete(`/api/me/shelves/${encodeURIComponent(shelfId)}`);
      setStatus({ kind: 'success', message: 'Полка удалена' });
      await load();
    } catch {
      setStatus({ kind: 'error', message: 'Не удалось удалить полку' });
    }
  }

  if (authRequired) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Войдите
            </Link>
            , чтобы создавать и редактировать полки.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <h2 className="text-[1.15rem] font-medium text-foreground">
            Новая полка
          </h2>
          <Form {...form}>
            <form
              className="flex flex-col gap-3"
              onSubmit={form.handleSubmit(handleCreate)}
              noValidate
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название полки</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="Например, Любимое"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (необязательно)</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Создать полку
              </Button>
            </form>
          </Form>
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
            Мои полки
          </h2>
          {loading ? (
            <p className="text-[0.95rem] text-muted">Загрузка…</p>
          ) : shelves.length === 0 ? (
            <p className="text-[0.95rem] text-muted">
              Пока нет полок. Создайте первую выше.
            </p>
          ) : (
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Список полок"
            >
              {shelves.map((shelf) => (
                <li
                  key={shelf.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <Link
                      href={`/library/shelves/${shelf.id}`}
                      className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                    >
                      {shelf.title}
                    </Link>
                    <p className="mt-0.5 text-[0.9rem] text-muted">
                      Книг: {shelf.itemCount}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(shelf.id)}
                  >
                    Удалить
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

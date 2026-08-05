'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PutUserBookBySlugInputSchema,
  type PutUserBookBySlugInput,
  type UserBookResponse,
  type UserBookStatus,
} from '@bookspace/schemas';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
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
import {
  USER_BOOK_STATUS_LABELS,
  USER_BOOK_STATUS_OPTIONS,
} from '@/lib/user-book-status';

type UserBookStatusFormProps = {
  workSlug: string;
};

type FormValues = PutUserBookBySlugInput;

export function UserBookStatusForm({ workSlug }: UserBookStatusFormProps) {
  const { user, status: authStatus } = useAuth();
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(PutUserBookBySlugInputSchema),
    defaultValues: {
      status: 'WANT',
      rating: null,
    },
  });

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (authStatus === 'pending' || !user) {
        setLoaded(true);
        return;
      }
      void (async () => {
        try {
          const { data } = await api.get<{ item: UserBookResponse | null }>(
            `/api/me/library/works/${encodeURIComponent(workSlug)}`,
          );
          if (cancelled) return;
          if (data.item) {
            form.reset({
              status: data.item.status,
              rating: data.item.rating,
            });
          }
        } catch {
          // leave defaults
        } finally {
          if (!cancelled) setLoaded(true);
        }
      })();
    });
    return () => {
      cancelled = true;
    };
  }, [authStatus, user, workSlug, form]);

  if (authStatus === 'pending') {
    return (
      <section
        aria-label="Статус и оценка"
        className="flex flex-col gap-3 font-sans"
      >
        <h2 className="text-[1.15rem] font-medium text-foreground">
          В моей библиотеке
        </h2>
        <p className="text-sm text-muted" role="status">
          Загрузка…
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section
        aria-label="Статус и оценка"
        className="flex flex-col gap-3 font-sans"
      >
        <h2 className="text-[1.15rem] font-medium text-foreground">
          В моей библиотеке
        </h2>
        <p className="text-[0.95rem] text-muted">
          <Link href="/login" className="underline-offset-2 hover:underline">
            Войдите
          </Link>
          , чтобы поставить статус и оценку.
        </p>
      </section>
    );
  }

  async function handleSubmit(values: FormValues) {
    setFeedback(null);
    try {
      const payload: PutUserBookBySlugInput = {
        status: values.status,
        rating:
          values.rating === undefined || values.rating === null
            ? null
            : values.rating,
      };
      await api.put(
        `/api/me/library/works/${encodeURIComponent(workSlug)}`,
        payload,
      );
      setFeedback({
        kind: 'success',
        message: 'Статус и оценка сохранены',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setFeedback({
            kind: 'error',
            message: 'Войдите, чтобы сохранить статус',
          });
          return;
        }
        setFeedback({
          kind: 'error',
          message: error.message || 'Не удалось сохранить',
        });
        return;
      }
      setFeedback({
        kind: 'error',
        message: 'Не удалось сохранить',
      });
    }
  }

  return (
    <section
      aria-label="Статус и оценка"
      className="flex flex-col gap-3 font-sans"
    >
      <h2 className="text-[1.15rem] font-medium text-foreground">
        В моей библиотеке
      </h2>
      {!loaded ? (
        <p className="text-sm text-muted" role="status">
          Загрузка…
        </p>
      ) : (
        <Form {...form}>
          <form
            className="flex flex-col gap-3"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal text-muted">
                    Статус
                  </FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      {...field}
                      value={field.value}
                      aria-label="Статус книги"
                    >
                      {USER_BOOK_STATUS_OPTIONS.map(
                        (status: UserBookStatus) => (
                          <option key={status} value={status}>
                            {USER_BOOK_STATUS_LABELS[status]}
                          </option>
                        ),
                      )}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal text-muted">
                    Оценка (1–10)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      inputMode="numeric"
                      placeholder="необязательно"
                      aria-label="Оценка книги"
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (raw === '') {
                          field.onChange(null);
                          return;
                        }
                        const n = Number(raw);
                        field.onChange(Number.isFinite(n) ? n : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full sm:w-auto">
              Сохранить
            </Button>
          </form>
        </Form>
      )}
    </section>
  );
}

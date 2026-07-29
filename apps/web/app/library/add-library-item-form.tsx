'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddLibraryItemInputSchema } from '@bookspace/schemas';
import { useForm } from 'react-hook-form';
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
import { getFriendlyZodIssueMessage } from '@/lib/form-errors';

type AddLibraryItemFormValues = {
  workId?: string;
};

export function AddLibraryItemForm() {
  const [status, setStatus] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  const form = useForm<AddLibraryItemFormValues>({
    resolver: zodResolver(AddLibraryItemInputSchema),
    defaultValues: {
      workId: '',
    },
  });

  async function handleValidSubmit(values: AddLibraryItemFormValues) {
    form.clearErrors('root');
    setStatus(null);

    const payload =
      values.workId && values.workId.trim().length > 0
        ? { workId: values.workId.trim() }
        : {};

    try {
      const response = await fetch('/api/me/library/items', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setStatus({
          kind: 'error',
          message: 'Войдите, чтобы добавить книгу в библиотеку',
        });
        return;
      }

      if (!response.ok) {
        let message = 'Не удалось добавить книгу';
        try {
          const body = (await response.json()) as {
            message?: string;
            errors?: { message?: string }[];
          };
          if (body.errors?.[0]?.message) {
            message = body.errors[0].message;
          } else if (body.message) {
            message = body.message;
          }
        } catch {
          // ignore parse errors
        }
        setStatus({ kind: 'error', message });
        return;
      }

      form.reset({ workId: '' });
      setStatus({
        kind: 'success',
        message: 'Добавлено в библиотеку (заглушка)',
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Не удалось добавить книгу',
      });
    }
  }

  function handleInvalidSubmit() {
    setStatus(null);
    const result = AddLibraryItemInputSchema.safeParse(form.getValues());
    if (result.success) {
      return;
    }
    for (const issue of result.error.issues) {
      if (issue.path[0] === 'workId') {
        form.setError('workId', {
          type: issue.code,
          message: getFriendlyZodIssueMessage(issue),
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
        noValidate
      >
        <FormField
          control={form.control}
          name="workId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-normal text-muted">
                ID произведения
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="work-1"
                  autoComplete="off"
                  maxLength={128}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {status ? (
          <p
            className={
              status.kind === 'success'
                ? 'text-sm text-foreground'
                : 'text-sm text-destructive'
            }
            role="status"
          >
            {status.message}
          </p>
        ) : null}
        <Button type="submit" className="w-full sm:w-auto">
          Добавить в библиотеку
        </Button>
      </form>
    </Form>
  );
}

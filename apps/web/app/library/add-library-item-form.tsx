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
import { ApiError, api } from '@/lib/http';

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
      await api.post('/api/me/library/items', payload);
      form.reset({ workId: '' });
      setStatus({
        kind: 'success',
        message: 'Добавлено в библиотеку (заглушка)',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setStatus({
            kind: 'error',
            message: 'Войдите, чтобы добавить книгу в библиотеку',
          });
          return;
        }
        setStatus({
          kind: 'error',
          message: error.message || 'Не удалось добавить книгу',
        });
        return;
      }
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

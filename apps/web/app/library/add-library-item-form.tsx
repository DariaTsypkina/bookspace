'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddLibraryItemInputSchema,
  type UserBookStatus,
} from '@bookspace/schemas';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { WorkSearchInput } from '@/components/work-search-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getFriendlyZodIssueMessage } from '@/lib/form-errors';
import { ApiError, api } from '@/lib/http';
import {
  resolveWorkSelectionPayload,
  type WorkSuggestion,
} from '@/lib/work-search';
import {
  USER_BOOK_STATUS_LABELS,
  USER_BOOK_STATUS_OPTIONS,
} from '@/lib/user-book-status';

type AddLibraryItemFormValues = {
  workSlug?: string;
  workId?: string;
  status: UserBookStatus;
  rating?: number | null;
};

type AddLibraryItemFormProps = {
  onSuccess?: () => void;
};

export function AddLibraryItemForm({ onSuccess }: AddLibraryItemFormProps) {
  const [status, setStatus] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [workInput, setWorkInput] = useState('');
  const [selectedWork, setSelectedWork] = useState<WorkSuggestion | null>(null);

  const form = useForm<AddLibraryItemFormValues>({
    resolver: zodResolver(AddLibraryItemInputSchema),
    defaultValues: {
      workSlug: '',
      status: 'WANT',
      rating: null,
    },
  });

  async function handleValidSubmit(values: AddLibraryItemFormValues) {
    form.clearErrors('root');
    setStatus(null);

    const selectionPayload = resolveWorkSelectionPayload({
      inputValue: workInput,
      selectedWork,
    });
    const payload = {
      workSlug:
        selectionPayload.workSlug ?? (values.workSlug?.trim() || undefined),
      workId: selectionPayload.workId ?? (values.workId?.trim() || undefined),
      status: values.status,
      rating: values.rating ?? null,
    };

    try {
      await api.post('/api/me/library/items', payload);
      form.reset({ workSlug: '', workId: '', status: 'WANT', rating: null });
      setWorkInput('');
      setSelectedWork(null);
      setStatus({
        kind: 'success',
        message: 'Статус сохранён',
      });
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setStatus({
            kind: 'error',
            message: 'Войдите, чтобы добавить книгу в библиотеку',
          });
          return;
        }
        if (error.status === 404) {
          setStatus({
            kind: 'error',
            message: 'Произведение не найдено',
          });
          return;
        }
        setStatus({
          kind: 'error',
          message: error.message || 'Не удалось сохранить',
        });
        return;
      }
      setStatus({
        kind: 'error',
        message: 'Не удалось сохранить',
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
      const key = issue.path[0];
      if (key === 'workSlug' || key === 'workId' || key === 'status') {
        form.setError(key, {
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
          name="workSlug"
          render={() => (
            <FormItem>
              <FormLabel className="font-normal text-muted">
                Книга (название или slug)
              </FormLabel>
              <FormControl>
                <WorkSearchInput
                  value={workInput}
                  onValueChange={(nextValue) => {
                    setWorkInput(nextValue);
                    setSelectedWork(null);
                    form.setValue('workSlug', nextValue);
                    form.setValue('workId', undefined);
                  }}
                  onWorkSelect={(work) => {
                    setSelectedWork(work);
                    setWorkInput(work.title);
                    form.setValue('workSlug', work.slug);
                    form.setValue('workId', work.id);
                  }}
                  ariaLabel="Книга для библиотеки"
                  placeholder="Введите название книги или slug"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-normal text-muted">Статус</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  aria-label="Статус книги"
                  {...field}
                  value={field.value}
                >
                  {USER_BOOK_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {USER_BOOK_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
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
          Сохранить в библиотеку
        </Button>
      </form>
    </Form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchQueryFormSchema } from '@bookspace/schemas';
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

type CatalogSearchFormProps = {
  initialQuery?: string;
};

type CatalogSearchFormValues = {
  query: string;
};

const SearchQuerySchema = SearchQueryFormSchema;

export function CatalogSearchForm({
  initialQuery = '',
}: CatalogSearchFormProps) {
  const router = useRouter();
  const form = useForm<CatalogSearchFormValues>({
    resolver: zodResolver(SearchQuerySchema),
    defaultValues: {
      query: initialQuery,
    },
  });

  const handleValidSubmit = ({ query }: CatalogSearchFormValues) => {
    const trimmed = query.trim();
    const nextUrl = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}`
      : '/search';
    router.push(nextUrl);
  };
  const handleInvalid = () => {
    const result = SearchQuerySchema.safeParse(form.getValues());
    if (result.success) {
      return;
    }

    const firstIssue = result.error.issues[0];
    if (!firstIssue || firstIssue.path[0] !== 'query') {
      return;
    }

    form.setError('query', {
      type: firstIssue.code,
      message: getFriendlyZodIssueMessage(firstIssue),
    });
  };

  return (
    <Form {...form}>
      <form
        method="get"
        action="/search"
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(handleValidSubmit, handleInvalid)}
        role="search"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-normal text-muted">
                Поисковый запрос
              </FormLabel>
              <FormControl>
                <Input
                  type="search"
                  placeholder="Книга, автор, серия…"
                  autoComplete="off"
                  {...field}
                  name="q"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto">
          Найти
        </Button>
      </form>
    </Form>
  );
}

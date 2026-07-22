'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CatalogSearchFormProps = {
  initialQuery?: string;
};

export function CatalogSearchForm({
  initialQuery = '',
}: CatalogSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const nextUrl = trimmed
      ? `/search?q=${encodeURIComponent(trimmed)}`
      : '/search';
    router.push(nextUrl);
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit} role="search">
      <Label htmlFor="catalog-search-input" className="font-normal text-muted">
        Поисковый запрос
      </Label>
      <Input
        id="catalog-search-input"
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Книга, автор, серия…"
        autoComplete="off"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Найти
      </Button>
    </form>
  );
}

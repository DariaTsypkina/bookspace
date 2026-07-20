'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

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
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <label htmlFor="catalog-search-input">Поисковый запрос</label>
      <input
        id="catalog-search-input"
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Книга, автор, серия…"
        autoComplete="off"
      />
      <button type="submit">Найти</button>
    </form>
  );
}

import Link from 'next/link';
import {
  fetchCatalogSearch,
  CATALOG_ENTITY_TYPE_LABELS,
  type CatalogSearchResponse,
} from '@/lib/catalog-search';
import { Card, CardContent } from '@/components/ui/card';
import { CatalogSearchForm } from './catalog-search-form';

/** Демо-запросы из seed (Гарри Поттер) — помогают проверить поиск локально. */
const DEMO_SEARCH_QUERIES = ['гарри', 'роулинг', 'potter'] as const;

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  let fetchError: string | null = null;
  let result: CatalogSearchResponse = { query: q.trim(), items: [] };

  try {
    result = await fetchCatalogSearch(q);
  } catch {
    fetchError =
      'Не удалось получить результаты поиска. Проверьте, что API запущен (pnpm dev, порт 8000) и выполнен seed: pnpm --filter api prisma:seed';
  }

  const hasQuery = result.query.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <header>
        <h1 className="mb-3 text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
          Поиск
        </h1>
        <CatalogSearchForm initialQuery={q} />
      </header>

      {!hasQuery && (
        <section className="font-sans text-muted" aria-label="Подсказки поиска">
          <p>Начните с названия книги, автора или персонажа.</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            {result.hints?.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </section>
      )}

      {fetchError && (
        <p
          className="rounded-lg border border-[color:var(--error)]/30 bg-[color:var(--error)]/5 px-4 py-3 font-sans text-[color:var(--error)]"
          role="alert"
        >
          {fetchError}
        </p>
      )}

      {hasQuery && !fetchError && result.items.length === 0 && (
        <section className="font-sans text-muted" aria-live="polite">
          <p>Ничего не найдено по запросу «{result.query}».</p>
          <p className="mt-3">
            Локально в каталоге только демо-данные (seed). Попробуйте, например:
          </p>
          <ul className="mt-3 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
            {DEMO_SEARCH_QUERIES.map((demoQuery) => (
              <li key={demoQuery}>
                <Link
                  href={`/search?q=${encodeURIComponent(demoQuery)}`}
                  className="text-accent underline"
                >
                  {demoQuery}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.items.length > 0 && (
        <ul
          className="flex list-none flex-col gap-3 p-0"
          aria-label="Результаты поиска"
        >
          {result.items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Card>
                <CardContent className="flex flex-col gap-1 px-4 py-3.5">
                  <span className="font-sans text-xs uppercase tracking-[0.04em] text-muted">
                    {CATALOG_ENTITY_TYPE_LABELS[item.type]}
                  </span>
                  <Link
                    href={item.path}
                    className="text-[1.05rem] font-medium no-underline hover:underline"
                  >
                    {item.title}
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

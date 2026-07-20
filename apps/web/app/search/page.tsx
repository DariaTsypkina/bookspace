import Link from 'next/link';
import {
  fetchCatalogSearch,
  CATALOG_ENTITY_TYPE_LABELS,
  type CatalogSearchResponse,
} from '@/lib/catalog-search';
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
    <main className="search-page">
      <header className="search-header">
        <h1>Поиск</h1>
        <CatalogSearchForm initialQuery={q} />
      </header>

      {!hasQuery && (
        <section className="search-hints" aria-label="Подсказки поиска">
          <p>Начните с названия книги, автора или персонажа.</p>
          <ul>
            {result.hints?.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </section>
      )}

      {fetchError && (
        <p className="search-error" role="alert">
          {fetchError}
        </p>
      )}

      {hasQuery && !fetchError && result.items.length === 0 && (
        <section className="search-empty" aria-live="polite">
          <p>Ничего не найдено по запросу «{result.query}».</p>
          <p>
            Локально в каталоге только демо-данные (seed). Попробуйте, например:
          </p>
          <ul className="search-demo-queries">
            {DEMO_SEARCH_QUERIES.map((demoQuery) => (
              <li key={demoQuery}>
                <Link href={`/search?q=${encodeURIComponent(demoQuery)}`}>
                  {demoQuery}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.items.length > 0 && (
        <ul className="search-results" aria-label="Результаты поиска">
          {result.items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="search-result">
              <span className="search-result-type">
                {CATALOG_ENTITY_TYPE_LABELS[item.type]}
              </span>
              <Link href={item.path} className="search-result-link">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

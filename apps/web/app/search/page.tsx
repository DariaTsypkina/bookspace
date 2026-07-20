import Link from 'next/link';
import {
  fetchCatalogSearch,
  CATALOG_ENTITY_TYPE_LABELS,
} from '@/lib/catalog-search';
import { CatalogSearchForm } from './catalog-search-form';

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const result = await fetchCatalogSearch(q);
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

      {hasQuery && result.items.length === 0 && (
        <p className="search-empty">
          Ничего не найдено по запросу «{result.query}».
        </p>
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

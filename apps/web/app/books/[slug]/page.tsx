import Link from 'next/link';
import { notFound } from 'next/navigation';
import { WorkContextReadingSection } from '@/components/work-context-reading-section';
import { fetchCatalogContextReadings } from '@/lib/catalog-context-reading';
import {
  CatalogWorkNotFoundError,
  fetchCatalogWork,
  formatEditionLanguage,
} from '@/lib/catalog-work';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;

  let work;
  try {
    work = await fetchCatalogWork(slug);
  } catch (error) {
    if (error instanceof CatalogWorkNotFoundError) {
      notFound();
    }
    throw error;
  }

  const { items: contextReadings } = await fetchCatalogContextReadings(slug);

  return (
    <main className="work-page">
      <article>
        <header className="work-header">
          <h1>{work.titleRu}</h1>
          {work.authors.length > 0 && (
            <p className="work-authors">
              {work.authors.map((author, index) => (
                <span key={author.slug}>
                  {index > 0 && ', '}
                  <Link href={`/authors/${author.slug}`}>{author.nameRu}</Link>
                </span>
              ))}
            </p>
          )}
          {work.yearFirst && (
            <p className="work-year">Год первого издания: {work.yearFirst}</p>
          )}
          {work.series && (
            <p className="work-series">
              Серия:{' '}
              <Link href={`/series/${work.series.slug}`}>
                {work.series.nameRu}
              </Link>
              {work.series.positionInSeries != null &&
                ` · книга ${work.series.positionInSeries}`}
            </p>
          )}
        </header>

        {work.editions.length > 0 && (
          <section className="work-editions" aria-label="Издания и переводы">
            <h2>Издания и переводы</h2>
            <ul>
              {work.editions.map((edition, index) => (
                <li key={`${edition.language}-${edition.isbn13 ?? index}`}>
                  <span className="edition-language">
                    {formatEditionLanguage(edition.language)}
                  </span>
                  {edition.translator && (
                    <span className="edition-translator">
                      Перевод: {edition.translator}
                    </span>
                  )}
                  {edition.isbn13 && (
                    <span className="edition-isbn">ISBN {edition.isbn13}</span>
                  )}
                  {edition.publisher && (
                    <span className="edition-publisher">
                      {edition.publisher}
                    </span>
                  )}
                  {edition.year && (
                    <span className="edition-year">{edition.year}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <WorkContextReadingSection items={contextReadings} />
      </article>
    </main>
  );
}

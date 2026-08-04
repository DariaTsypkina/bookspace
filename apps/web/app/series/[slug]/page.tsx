import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SpoilerGate } from '@/components/spoiler-gate';
import { Card, CardContent } from '@/components/ui/card';
import {
  CatalogSeriesNotFoundError,
  fetchCatalogSeries,
} from '@/lib/catalog-series';
import { hasSpoilersConsent, SPOILERS_OK_COOKIE } from '@/lib/spoiler-gate';

type SeriesPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const series = await fetchCatalogSeries(slug);
    return {
      title: `${series.nameRu} — Книжная вселенная`,
      description: series.nameOrig
        ? `${series.nameRu} (${series.nameOrig}) — книги серии в каталоге`
        : `${series.nameRu} — книги серии в каталоге`,
    };
  } catch (error) {
    if (error instanceof CatalogSeriesNotFoundError) {
      return { title: 'Серия не найдена — Книжная вселенная' };
    }
    throw error;
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const spoilersAccepted = hasSpoilersConsent(
    cookieStore.get(SPOILERS_OK_COOKIE)?.value,
  );

  let series;
  try {
    series = await fetchCatalogSeries(slug);
  } catch (error) {
    if (error instanceof CatalogSeriesNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {series.nameRu}
          </h1>
          {series.nameOrig && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              {series.nameOrig}
            </p>
          )}
        </header>

        <section aria-label="Книги серии">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Книги
          </h2>
          {series.works.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              В каталоге пока нет опубликованных книг этой серии.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-3 p-0">
              {series.works.map((work) => (
                <li key={work.slug}>
                  <Card>
                    <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                      <Link
                        href={`/books/${work.slug}`}
                        className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                      >
                        {work.titleRu}
                      </Link>
                      {(work.positionInSeries != null ||
                        work.yearFirst != null) && (
                        <span className="font-sans text-[0.9rem] text-muted">
                          {[
                            work.positionInSeries != null
                              ? `книга ${work.positionInSeries}`
                              : null,
                            work.yearFirst != null
                              ? String(work.yearFirst)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {series.readingOrder.length > 0 && (
          <section aria-label="Порядок чтения">
            <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
              Порядок чтения
            </h2>
            <SpoilerGate initialAccepted={spoilersAccepted}>
              <ol className="flex list-none flex-col gap-3 p-0">
                {series.readingOrder.map((step) => (
                  <li key={`${step.step}-${step.slug}`}>
                    <Card>
                      <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                        <span className="font-sans text-[0.9rem] text-muted">
                          Шаг {step.step}
                        </span>
                        <Link
                          href={`/books/${step.slug}`}
                          className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                        >
                          {step.titleRu}
                        </Link>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
            </SpoilerGate>
          </section>
        )}
      </article>
    </main>
  );
}

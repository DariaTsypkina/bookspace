import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SpoilerGate } from '@/components/spoiler-gate';
import { WorkContextReadingSection } from '@/components/work-context-reading-section';
import { Card, CardContent } from '@/components/ui/card';
import { fetchCatalogContextReadings } from '@/lib/catalog-context-reading';
import {
  CatalogWorkNotFoundError,
  fetchCatalogWork,
  formatEditionLanguage,
  WORK_RELATION_LABELS,
} from '@/lib/catalog-work';
import { hasSpoilersConsent, SPOILERS_OK_COOKIE } from '@/lib/spoiler-gate';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const work = await fetchCatalogWork(slug);
    return {
      title: `${work.titleRu} — Книжная вселенная`,
      description: work.titleOrig
        ? `${work.titleRu} (${work.titleOrig}) — произведение в каталоге`
        : `${work.titleRu} — произведение в каталоге`,
    };
  } catch (error) {
    if (error instanceof CatalogWorkNotFoundError) {
      return { title: 'Произведение не найдено — Книжная вселенная' };
    }
    throw error;
  }
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const spoilersAccepted = hasSpoilersConsent(
    cookieStore.get(SPOILERS_OK_COOKIE)?.value,
  );

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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {work.titleRu}
          </h1>
          {work.authors.length > 0 && (
            <p className="mt-2 text-[1.05rem] text-foreground">
              {work.authors.map((author, index) => (
                <span key={author.slug}>
                  {index > 0 && ', '}
                  <Link
                    href={`/authors/${author.slug}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {author.nameRu}
                  </Link>
                </span>
              ))}
            </p>
          )}
          {work.yearFirst && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              Год первого издания: {work.yearFirst}
            </p>
          )}
          {work.series && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              Серия:{' '}
              <Link
                href={`/series/${work.series.slug}`}
                className="underline-offset-2 hover:underline"
              >
                {work.series.nameRu}
              </Link>
              {work.series.positionInSeries != null &&
                ` · книга ${work.series.positionInSeries}`}
            </p>
          )}
        </header>

        {work.editions.length > 0 && (
          <section aria-label="Издания и переводы">
            <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
              Издания и переводы
            </h2>
            <ul className="flex list-none flex-col gap-3 p-0">
              {work.editions.map((edition, index) => (
                <li key={`${edition.language}-${edition.isbn13 ?? index}`}>
                  <Card>
                    <CardContent className="flex flex-col gap-0.5 px-4 py-3.5 font-sans text-[0.95rem]">
                      <span className="font-medium text-foreground">
                        {formatEditionLanguage(edition.language)}
                      </span>
                      {edition.translator && (
                        <span className="text-[0.9rem] text-muted">
                          Перевод: {edition.translator}
                        </span>
                      )}
                      {edition.isbn13 && (
                        <span className="text-[0.9rem] text-muted">
                          ISBN {edition.isbn13}
                        </span>
                      )}
                      {edition.publisher && (
                        <span className="text-[0.9rem] text-muted">
                          {edition.publisher}
                        </span>
                      )}
                      {edition.year && (
                        <span className="text-[0.9rem] text-muted">
                          {edition.year}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {work.relations.length > 0 && (
          <section aria-label="Связи произведений">
            <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
              Связи
            </h2>
            <SpoilerGate initialAccepted={spoilersAccepted}>
              <ul className="flex list-none flex-col gap-3 p-0">
                {work.relations.map((relation) => (
                  <li key={`${relation.slug}-${relation.type}`}>
                    <Card>
                      <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                        <Link
                          href={`/books/${relation.slug}`}
                          className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                        >
                          {relation.titleRu}
                        </Link>
                        <span className="font-sans text-[0.9rem] text-muted">
                          {WORK_RELATION_LABELS[relation.type]}
                        </span>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </SpoilerGate>
          </section>
        )}

        <WorkContextReadingSection items={contextReadings} />
      </article>
    </main>
  );
}

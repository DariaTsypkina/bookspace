import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  CatalogPlaceNotFoundError,
  fetchCatalogPlace,
} from '@/lib/catalog-place';

type PlacePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const place = await fetchCatalogPlace(slug);
    return {
      title: `${place.nameRu} — Книжная вселенная`,
      description: place.nameOrig
        ? `${place.nameRu} (${place.nameOrig}) — локация в каталоге`
        : `${place.nameRu} — локация в каталоге`,
    };
  } catch (error) {
    if (error instanceof CatalogPlaceNotFoundError) {
      return { title: 'Локация не найдена — Книжная вселенная' };
    }
    throw error;
  }
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;

  let place;
  try {
    place = await fetchCatalogPlace(slug);
  } catch (error) {
    if (error instanceof CatalogPlaceNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {place.nameRu}
          </h1>
          {place.nameOrig && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              {place.nameOrig}
            </p>
          )}
        </header>

        {place.world && (
          <section aria-label="Мир локации">
            <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
              Мир
            </h2>
            <Card>
              <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                <Link
                  href={`/worlds/${place.world.slug}`}
                  className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                >
                  {place.world.nameRu}
                </Link>
                {place.world.nameOrig && (
                  <span className="font-sans text-[0.9rem] text-muted">
                    {place.world.nameOrig}
                  </span>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        <section aria-label="Книги локации">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Книги
          </h2>
          {place.works.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              В каталоге пока нет опубликованных книг, связанных с этой
              локацией.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-3 p-0">
              {place.works.map((work) => (
                <li key={work.slug}>
                  <Card>
                    <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                      <Link
                        href={`/books/${work.slug}`}
                        className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                      >
                        {work.titleRu}
                      </Link>
                      {work.yearFirst != null && (
                        <span className="font-sans text-[0.9rem] text-muted">
                          {work.yearFirst}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </main>
  );
}

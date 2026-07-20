import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
    <main className="place-page">
      <article>
        <header className="place-header">
          <h1>{place.nameRu}</h1>
          {place.nameOrig && (
            <p className="place-name-orig">{place.nameOrig}</p>
          )}
        </header>

        {place.world && (
          <section className="place-world" aria-label="Мир локации">
            <h2>Мир</h2>
            <p>
              <Link
                href={`/worlds/${place.world.slug}`}
                className="place-world-link"
              >
                {place.world.nameRu}
              </Link>
              {place.world.nameOrig && (
                <span className="place-world-orig">{place.world.nameOrig}</span>
              )}
            </p>
          </section>
        )}

        <section className="place-works" aria-label="Книги локации">
          <h2>Книги</h2>
          {place.works.length === 0 ? (
            <p className="place-works-empty">
              В каталоге пока нет опубликованных книг, связанных с этой
              локацией.
            </p>
          ) : (
            <ul>
              {place.works.map((work) => (
                <li key={work.slug}>
                  <Link
                    href={`/books/${work.slug}`}
                    className="place-work-link"
                  >
                    {work.titleRu}
                  </Link>
                  {work.yearFirst != null && (
                    <span className="place-work-year">{work.yearFirst}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CatalogWorldNotFoundError,
  fetchCatalogWorld,
} from '@/lib/catalog-world';

type WorldPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: WorldPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const world = await fetchCatalogWorld(slug);
    return {
      title: `${world.nameRu} — Книжная вселенная`,
      description: world.descriptionRu
        ? world.descriptionRu
        : world.nameOrig
          ? `${world.nameRu} (${world.nameOrig}) — мир в каталоге`
          : `${world.nameRu} — мир в каталоге`,
    };
  } catch (error) {
    if (error instanceof CatalogWorldNotFoundError) {
      return { title: 'Мир не найден — Книжная вселенная' };
    }
    throw error;
  }
}

export default async function WorldPage({ params }: WorldPageProps) {
  const { slug } = await params;

  let world;
  try {
    world = await fetchCatalogWorld(slug);
  } catch (error) {
    if (error instanceof CatalogWorldNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="world-page">
      <article>
        <header className="world-header">
          <h1>{world.nameRu}</h1>
          {world.nameOrig && (
            <p className="world-name-orig">{world.nameOrig}</p>
          )}
          {world.descriptionRu && (
            <p className="world-description">{world.descriptionRu}</p>
          )}
        </header>

        <section className="world-places" aria-label="Локации мира">
          <h2>Локации</h2>
          {world.places.length === 0 ? (
            <p className="world-places-empty">
              В каталоге пока нет опубликованных локаций этого мира.
            </p>
          ) : (
            <ul>
              {world.places.map((place) => (
                <li key={place.slug}>
                  <Link
                    href={`/places/${place.slug}`}
                    className="world-place-link"
                  >
                    {place.nameRu}
                  </Link>
                  {place.nameOrig && (
                    <span className="world-place-orig">{place.nameOrig}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="world-works" aria-label="Книги мира">
          <h2>Книги</h2>
          {world.works.length === 0 ? (
            <p className="world-works-empty">
              В каталоге пока нет опубликованных книг, связанных с этим миром.
            </p>
          ) : (
            <ul>
              {world.works.map((work) => (
                <li key={work.slug}>
                  <Link
                    href={`/books/${work.slug}`}
                    className="world-work-link"
                  >
                    {work.titleRu}
                  </Link>
                  {work.yearFirst != null && (
                    <span className="world-work-year">{work.yearFirst}</span>
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

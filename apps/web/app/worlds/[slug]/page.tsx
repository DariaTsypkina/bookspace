import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {world.nameRu}
          </h1>
          {world.nameOrig && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              {world.nameOrig}
            </p>
          )}
          {world.descriptionRu && (
            <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-foreground">
              {world.descriptionRu}
            </p>
          )}
        </header>

        <section aria-label="Локации мира">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Локации
          </h2>
          {world.places.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              В каталоге пока нет опубликованных локаций этого мира.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-3 p-0">
              {world.places.map((place) => (
                <li key={place.slug}>
                  <Card>
                    <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                      <Link
                        href={`/places/${place.slug}`}
                        className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                      >
                        {place.nameRu}
                      </Link>
                      {place.nameOrig && (
                        <span className="font-sans text-[0.9rem] text-muted">
                          {place.nameOrig}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Книги мира">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Книги
          </h2>
          {world.works.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              В каталоге пока нет опубликованных книг, связанных с этим миром.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-3 p-0">
              {world.works.map((work) => (
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

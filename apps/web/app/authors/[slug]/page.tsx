import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  CatalogAuthorNotFoundError,
  fetchCatalogAuthor,
} from '@/lib/catalog-author';

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const author = await fetchCatalogAuthor(slug);
    return {
      title: `${author.nameRu} — Книжная вселенная`,
      description: author.nameOrig
        ? `${author.nameRu} (${author.nameOrig}) — книги автора в каталоге`
        : `${author.nameRu} — книги автора в каталоге`,
    };
  } catch (error) {
    if (error instanceof CatalogAuthorNotFoundError) {
      return { title: 'Автор не найден — Книжная вселенная' };
    }
    throw error;
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;

  let author;
  try {
    author = await fetchCatalogAuthor(slug);
  } catch (error) {
    if (error instanceof CatalogAuthorNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {author.nameRu}
          </h1>
          {author.nameOrig && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              {author.nameOrig}
            </p>
          )}
        </header>

        <section aria-label="Книги автора">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Книги
          </h2>
          {author.works.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              В каталоге пока нет опубликованных книг этого автора.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-3 p-0">
              {author.works.map((work) => (
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

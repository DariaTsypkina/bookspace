import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
    <main className="author-page">
      <article>
        <header className="author-header">
          <h1>{author.nameRu}</h1>
          {author.nameOrig && (
            <p className="author-name-orig">{author.nameOrig}</p>
          )}
        </header>

        <section className="author-works" aria-label="Книги автора">
          <h2>Книги</h2>
          {author.works.length === 0 ? (
            <p className="author-works-empty">
              В каталоге пока нет опубликованных книг этого автора.
            </p>
          ) : (
            <ul>
              {author.works.map((work) => (
                <li key={work.slug}>
                  <Link
                    href={`/books/${work.slug}`}
                    className="author-work-link"
                  >
                    {work.titleRu}
                  </Link>
                  {work.yearFirst != null && (
                    <span className="author-work-year">{work.yearFirst}</span>
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

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  fetchPublicUserBook,
  PublicLibraryNotFoundError,
} from '@/lib/public-library';
import { tryParseProfileSlug } from '@/lib/profile-slug';
import {
  formatUserBookRating,
  formatUserBookStatus,
} from '@/lib/user-book-status';
import { parseCatalogEntitySlug } from '@/lib/catalog-entity-slug';

type PublicUserBookPageProps = {
  params: Promise<{ slug: string; workSlug: string }>;
};

export default async function PublicUserBookPage({
  params,
}: PublicUserBookPageProps) {
  const { slug: rawSlug, workSlug: rawWorkSlug } = await params;
  const slug = tryParseProfileSlug(rawSlug);
  let workSlug: string | null = null;
  try {
    workSlug = parseCatalogEntitySlug(rawWorkSlug);
  } catch {
    workSlug = null;
  }

  if (!slug || !workSlug) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Книга
        </h1>
        <Card>
          <CardContent className="px-4 py-3.5 font-sans text-[0.95rem] text-muted">
            Книга не найдена в коллекции.
          </CardContent>
        </Card>
      </main>
    );
  }

  let book: Awaited<ReturnType<typeof fetchPublicUserBook>> | null = null;
  try {
    book = await fetchPublicUserBook(slug, workSlug);
  } catch (error) {
    if (!(error instanceof PublicLibraryNotFoundError)) {
      throw error;
    }
  }

  if (!book) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
        <p className="text-[0.9rem] text-muted">
          <Link
            href={`/u/${slug}`}
            className="underline-offset-2 hover:underline"
          >
            ← Профиль
          </Link>
        </p>
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Книга
        </h1>
        <Card>
          <CardContent className="px-4 py-3.5 font-sans text-[0.95rem] text-muted">
            Книга не найдена в коллекции.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <p className="text-[0.9rem] text-muted">
        <Link
          href={`/u/${slug}`}
          className="underline-offset-2 hover:underline"
        >
          ← Профиль {slug}
        </Link>
      </p>
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        {book.titleRu}
      </h1>
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            В коллекции{' '}
            <strong className="font-medium text-foreground">{slug}</strong>
          </p>
          <p
            className="text-[1.05rem] text-foreground"
            aria-label="Статус и оценка владельца"
          >
            {formatUserBookStatus(book.status)}
            {' · '}
            {formatUserBookRating(book.rating)}
          </p>
          {book.tags.length > 0 ? (
            <p
              className="text-[0.9rem] text-muted"
              aria-label={`Теги: ${book.tags.map((t) => t.name).join(', ')}`}
            >
              Теги: {book.tags.map((tag) => tag.name).join(', ')}
            </p>
          ) : null}
          <p className="text-[0.9rem]">
            <Link
              href={`/books/${book.workSlug}`}
              className="underline-offset-2 hover:underline"
            >
              Страница в каталоге
            </Link>
          </p>
        </CardContent>
      </Card>

      {book.notes.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 px-4 py-3.5 font-sans">
            <h2 className="text-[1.15rem] font-medium text-foreground">
              Заметки
            </h2>
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Публичные заметки к книге"
            >
              {book.notes.map((note) => (
                <li key={note.id}>
                  <p className="text-[0.95rem] text-foreground">{note.body}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

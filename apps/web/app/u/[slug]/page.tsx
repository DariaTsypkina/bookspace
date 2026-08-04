import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { Card, CardContent } from '@/components/ui/card';
import {
  fetchPublicLibrary,
  PublicLibraryNotFoundError,
} from '@/lib/public-library';
import {
  fetchPublicShelves,
  PublicShelvesNotFoundError,
} from '@/lib/public-shelves';
import { tryParseProfileSlug } from '@/lib/profile-slug';
import {
  formatUserBookRating,
  formatUserBookStatus,
} from '@/lib/user-book-status';

type ProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProfileStubPage({ params }: ProfilePageProps) {
  const { slug: rawSlug } = await params;
  const slug = tryParseProfileSlug(rawSlug);

  if (!slug) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Профиль
        </h1>
        <Card>
          <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
            <p className="text-[0.95rem] text-muted">Профиль не найден.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  let library: Awaited<ReturnType<typeof fetchPublicLibrary>> | null = null;
  let shelves: Awaited<ReturnType<typeof fetchPublicShelves>> | null = null;
  let notFoundUser = false;
  try {
    library = await fetchPublicLibrary(slug);
    shelves = await fetchPublicShelves(slug);
  } catch (error) {
    if (
      error instanceof PublicLibraryNotFoundError ||
      error instanceof PublicShelvesNotFoundError
    ) {
      notFoundUser = true;
    } else {
      throw error;
    }
  }

  if (notFoundUser) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Профиль
        </h1>
        <Card>
          <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
            <p className="text-[0.95rem] text-muted">Профиль не найден.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const items = library?.items ?? [];
  const shelfList = shelves?.shelves ?? [];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        Профиль
      </h1>
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            Публичная коллекция{' '}
            <strong className="font-medium text-foreground">{slug}</strong>
          </p>
          {items.length === 0 ? (
            <p className="text-[0.95rem] text-muted">
              Пока нет книг со статусом.
            </p>
          ) : (
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Книги в коллекции"
            >
              {items.map((item) => (
                <li key={item.workSlug}>
                  <Link
                    href={`/books/${item.workSlug}`}
                    className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                  >
                    {item.titleRu}
                  </Link>
                  <p className="mt-0.5 text-[0.9rem] text-muted">
                    {formatUserBookStatus(item.status)}
                    {' · '}
                    {formatUserBookRating(item.rating)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <h2 className="text-[1.15rem] font-medium text-foreground">Полки</h2>
          {shelfList.length === 0 ? (
            <p className="text-[0.95rem] text-muted">Пока нет полок.</p>
          ) : (
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Полки пользователя"
            >
              {shelfList.map((shelf) => (
                <li key={shelf.slug}>
                  <Link
                    href={`/u/${slug}/shelves/${shelf.slug}`}
                    className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                  >
                    {shelf.title}
                  </Link>
                  <p className="mt-0.5 text-[0.9rem] text-muted">
                    Книг: {shelf.itemCount}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}

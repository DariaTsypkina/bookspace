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
  const notes = library?.notes ?? [];
  const goal = library?.goal ?? null;

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
                    href={`/u/${slug}/books/${item.workSlug}`}
                    className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                  >
                    {item.titleRu}
                  </Link>
                  <p className="mt-0.5 text-[0.9rem] text-muted">
                    {formatUserBookStatus(item.status)}
                    {' · '}
                    {formatUserBookRating(item.rating)}
                  </p>
                  {item.tags.length > 0 ? (
                    <p
                      className="mt-0.5 text-[0.9rem] text-muted"
                      aria-label={`Теги: ${item.tags.map((t) => t.name).join(', ')}`}
                    >
                      Теги: {item.tags.map((tag) => tag.name).join(', ')}
                    </p>
                  ) : null}
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
        </CardContent>
      </Card>

      {notes.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
            <h2 className="text-[1.15rem] font-medium text-foreground">
              Заметки
            </h2>
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Публичные заметки"
            >
              {notes.map((note) => (
                <li key={note.id}>
                  <p className="text-[0.95rem] text-foreground">{note.body}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {goal ? (
        <Card>
          <CardContent className="flex flex-col gap-2 px-4 py-3.5 font-sans">
            <h2 className="text-[1.15rem] font-medium text-foreground">
              Цель на {goal.year}
            </h2>
            <p
              className="text-[0.95rem] text-muted"
              aria-label="Цель чтения на год"
            >
              Прогресс: {goal.progressCount} из {goal.targetCount}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <LogoutButton />
    </main>
  );
}

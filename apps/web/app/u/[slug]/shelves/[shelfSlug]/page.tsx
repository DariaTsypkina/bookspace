import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  fetchPublicShelf,
  PublicShelvesNotFoundError,
} from '@/lib/public-shelves';
import { tryParseProfileSlug } from '@/lib/profile-slug';

type PublicShelfPageProps = {
  params: Promise<{ slug: string; shelfSlug: string }>;
};

export default async function PublicShelfPage({
  params,
}: PublicShelfPageProps) {
  const { slug: rawSlug, shelfSlug: rawShelfSlug } = await params;
  const slug = tryParseProfileSlug(rawSlug);
  const shelfSlug = tryParseProfileSlug(rawShelfSlug);

  if (!slug || !shelfSlug) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Полка
        </h1>
        <Card>
          <CardContent className="px-4 py-3.5 font-sans text-[0.95rem] text-muted">
            Полка не найдена.
          </CardContent>
        </Card>
      </main>
    );
  }

  let shelf: Awaited<ReturnType<typeof fetchPublicShelf>> | null = null;
  try {
    shelf = await fetchPublicShelf(slug, shelfSlug);
  } catch (error) {
    if (!(error instanceof PublicShelvesNotFoundError)) {
      throw error;
    }
  }

  if (!shelf) {
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
          Полка
        </h1>
        <Card>
          <CardContent className="px-4 py-3.5 font-sans text-[0.95rem] text-muted">
            Полка не найдена.
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
        {shelf.title}
      </h1>
      {shelf.description ? (
        <p className="font-sans text-[0.95rem] text-muted">
          {shelf.description}
        </p>
      ) : null}
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          {shelf.items.length === 0 ? (
            <p className="text-[0.95rem] text-muted">На полке пока пусто.</p>
          ) : (
            <ul
              className="flex list-none flex-col gap-3 p-0"
              aria-label="Книги на полке"
            >
              {shelf.items.map((item) => (
                <li key={item.workSlug}>
                  <Link
                    href={`/books/${item.workSlug}`}
                    className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                  >
                    {item.titleRu}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

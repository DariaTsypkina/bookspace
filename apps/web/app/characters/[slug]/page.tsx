import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SpoilerGate } from '@/components/spoiler-gate';
import { Card, CardContent } from '@/components/ui/card';
import {
  CatalogCharacterNotFoundError,
  fetchCatalogCharacter,
} from '@/lib/catalog-character';
import {
  CHARACTER_RELATION_LABELS,
  hasSpoilersConsent,
  SPOILERS_OK_COOKIE,
} from '@/lib/spoiler-gate';

type CharacterPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CharacterPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const character = await fetchCatalogCharacter(slug);
    return {
      title: `${character.nameRu} — Книжная вселенная`,
      description: character.nameOrig
        ? `${character.nameRu} (${character.nameOrig}) — персонаж в каталоге`
        : `${character.nameRu} — персонаж в каталоге`,
    };
  } catch (error) {
    if (error instanceof CatalogCharacterNotFoundError) {
      return { title: 'Персонаж не найден — Книжная вселенная' };
    }
    throw error;
  }
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const spoilersAccepted = hasSpoilersConsent(
    cookieStore.get(SPOILERS_OK_COOKIE)?.value,
  );

  let character;
  try {
    character = await fetchCatalogCharacter(slug);
  } catch (error) {
    if (error instanceof CatalogCharacterNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <article className="flex flex-col gap-6">
        <header>
          <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
            {character.nameRu}
          </h1>
          {character.nameOrig && (
            <p className="mt-1.5 font-sans text-[0.95rem] text-muted">
              {character.nameOrig}
            </p>
          )}
        </header>

        <section aria-label="Книги появления">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Книги появления
          </h2>
          {character.appearances.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              В каталоге пока нет опубликованных книг с этим персонажем.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-3 p-0">
              {character.appearances.map((appearance) => (
                <li key={appearance.slug}>
                  <Card>
                    <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                      <Link
                        href={`/books/${appearance.slug}`}
                        className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                      >
                        {appearance.titleRu}
                      </Link>
                      {appearance.yearFirst != null && (
                        <span className="font-sans text-[0.9rem] text-muted">
                          {appearance.yearFirst}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Связи персонажа">
          <h2 className="mb-3 font-sans text-[1.15rem] font-medium text-foreground">
            Связи
          </h2>
          {character.relations.length === 0 ? (
            <p className="font-sans text-[0.95rem] text-muted">
              Связи с другими персонажами пока не добавлены.
            </p>
          ) : (
            <SpoilerGate initialAccepted={spoilersAccepted}>
              <ul className="flex list-none flex-col gap-3 p-0">
                {character.relations.map((relation) => (
                  <li key={`${relation.slug}-${relation.type}`}>
                    <Card>
                      <CardContent className="flex flex-col gap-0.5 px-4 py-3.5">
                        <Link
                          href={`/characters/${relation.slug}`}
                          className="text-[1.05rem] font-medium no-underline underline-offset-2 hover:underline"
                        >
                          {relation.nameRu}
                        </Link>
                        <span className="font-sans text-[0.9rem] text-muted">
                          {CHARACTER_RELATION_LABELS[relation.type]}
                        </span>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </SpoilerGate>
          )}
        </section>
      </article>
    </main>
  );
}

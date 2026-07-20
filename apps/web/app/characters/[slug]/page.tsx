import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { SpoilerGate } from '@/components/spoiler-gate';
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
    <main className="character-page">
      <article>
        <header className="character-header">
          <h1>{character.nameRu}</h1>
          {character.nameOrig && (
            <p className="character-name-orig">{character.nameOrig}</p>
          )}
        </header>

        <section className="character-appearances" aria-label="Книги появления">
          <h2>Книги появления</h2>
          {character.appearances.length === 0 ? (
            <p className="character-appearances-empty">
              В каталоге пока нет опубликованных книг с этим персонажем.
            </p>
          ) : (
            <ul>
              {character.appearances.map((appearance) => (
                <li key={appearance.slug}>
                  <Link
                    href={`/books/${appearance.slug}`}
                    className="character-appearance-link"
                  >
                    {appearance.titleRu}
                  </Link>
                  {appearance.yearFirst != null && (
                    <span className="character-appearance-year">
                      {appearance.yearFirst}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="character-relations" aria-label="Связи персонажа">
          <h2>Связи</h2>
          {character.relations.length === 0 ? (
            <p className="character-relations-empty">
              Связи с другими персонажами пока не добавлены.
            </p>
          ) : (
            <SpoilerGate initialAccepted={spoilersAccepted}>
              <ul>
                {character.relations.map((relation) => (
                  <li key={`${relation.slug}-${relation.type}`}>
                    <Link
                      href={`/characters/${relation.slug}`}
                      className="character-relation-link"
                    >
                      {relation.nameRu}
                    </Link>
                    <span className="character-relation-type">
                      {CHARACTER_RELATION_LABELS[relation.type]}
                    </span>
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

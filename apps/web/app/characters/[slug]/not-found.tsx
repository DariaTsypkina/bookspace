import Link from 'next/link';

export default function CharacterNotFound() {
  return (
    <main className="character-page character-not-found">
      <h1>Персонаж не найден</h1>
      <p>Такого персонажа нет в каталоге или он ещё не опубликован.</p>
      <p>
        <Link href="/search">Вернуться к поиску</Link>
      </p>
    </main>
  );
}

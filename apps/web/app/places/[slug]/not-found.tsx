import Link from 'next/link';

export default function PlaceNotFound() {
  return (
    <main className="place-page place-not-found">
      <h1>Локация не найдена</h1>
      <p>Такой локации нет в каталоге или она ещё не опубликована.</p>
      <p>
        <Link href="/search">Вернуться к поиску</Link>
      </p>
    </main>
  );
}

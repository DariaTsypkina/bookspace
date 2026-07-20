import Link from 'next/link';

export default function WorldNotFound() {
  return (
    <main className="world-page world-not-found">
      <h1>Мир не найден</h1>
      <p>Такого мира нет в каталоге или он ещё не опубликован.</p>
      <p>
        <Link href="/search">Вернуться к поиску</Link>
      </p>
    </main>
  );
}

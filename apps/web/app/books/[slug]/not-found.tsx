import Link from 'next/link';

export default function WorkNotFound() {
  return (
    <main className="work-page work-not-found">
      <h1>Произведение не найдено</h1>
      <p>Такой книги нет в каталоге или она ещё не опубликована.</p>
      <p>
        <Link href="/search">Вернуться к поиску</Link>
      </p>
    </main>
  );
}

import Link from 'next/link';

export default function AuthorNotFound() {
  return (
    <main className="author-page author-not-found">
      <h1>Автор не найден</h1>
      <p>Такого автора нет в каталоге или он ещё не опубликован.</p>
      <p>
        <Link href="/search">Вернуться к поиску</Link>
      </p>
    </main>
  );
}

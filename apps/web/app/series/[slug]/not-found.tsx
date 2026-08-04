import Link from 'next/link';

export default function SeriesNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-2xl font-normal tracking-[0.02em] text-foreground">
        Серия не найдена
      </h1>
      <p className="font-sans text-muted">
        Такой серии нет в каталоге или она ещё не опубликована.
      </p>
      <p className="font-sans">
        <Link href="/search" className="text-accent underline">
          Вернуться к поиску
        </Link>
      </p>
    </main>
  );
}

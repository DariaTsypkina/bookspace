import { LibraryCabinet } from './library-cabinet';

export default function LibraryPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        Моя библиотека
      </h1>
      <LibraryCabinet />
    </main>
  );
}

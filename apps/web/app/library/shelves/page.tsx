import Link from 'next/link';
import { ShelvesManager } from './shelves-manager';

export default function LibraryShelvesPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <div className="flex flex-col gap-2">
        <p className="text-[0.9rem] text-muted">
          <Link href="/library" className="underline-offset-2 hover:underline">
            ← Моя библиотека
          </Link>
        </p>
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Полки
        </h1>
      </div>
      <ShelvesManager />
    </main>
  );
}

import Link from 'next/link';
import { ShelfDetailManager } from './shelf-detail-manager';

export default function LibraryShelfDetailPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <p className="text-[0.9rem] text-muted">
        <Link
          href="/library/shelves"
          className="underline-offset-2 hover:underline"
        >
          ← Полки
        </Link>
      </p>
      <ShelfDetailManager />
    </main>
  );
}

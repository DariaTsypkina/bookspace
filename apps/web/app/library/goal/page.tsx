import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

/** Placeholder until epic bd-sf4 (reading goal CRUD). */
export default function LibraryGoalPlaceholderPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <div className="flex flex-col gap-2">
        <p className="text-[0.9rem] text-muted">
          <Link href="/library" className="underline-offset-2 hover:underline">
            ← Моя библиотека
          </Link>
        </p>
        <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
          Цель на год
        </h1>
      </div>
      <Card>
        <CardContent className="px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            Цель чтения на год появится в следующем этапе. Пока можно вести
            статусы и полки в библиотеке.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

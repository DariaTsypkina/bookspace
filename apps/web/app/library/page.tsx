import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { Card, CardContent } from '@/components/ui/card';
import { AddLibraryItemForm } from './add-library-item-form';

export default function LibraryStubPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        Моя библиотека
      </h1>
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            Коллекция и фильтры появятся здесь. Полки уже доступны.
          </p>
          <p>
            <Link
              href="/library/shelves"
              className="text-[1.05rem] font-medium text-foreground no-underline underline-offset-2 hover:underline"
            >
              Мои полки
            </Link>
          </p>
          <AddLibraryItemForm />
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}

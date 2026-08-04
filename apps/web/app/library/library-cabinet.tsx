'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { Card, CardContent } from '@/components/ui/card';
import { AddLibraryItemForm } from './add-library-item-form';
import { LibraryCollection } from './library-collection';

export function LibraryCabinet() {
  const [reloadToken, setReloadToken] = useState(0);

  return (
    <div className="flex flex-col gap-5">
      <nav
        aria-label="Разделы библиотеки"
        className="flex flex-wrap gap-x-4 gap-y-2 text-[1.05rem]"
      >
        <Link
          href="/library/shelves"
          className="font-medium text-foreground no-underline underline-offset-2 hover:underline"
        >
          Мои полки
        </Link>
        <Link
          href="/library/goal"
          className="font-medium text-foreground no-underline underline-offset-2 hover:underline"
        >
          Цель на год
        </Link>
      </nav>

      <LibraryCollection reloadToken={reloadToken} />

      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <AddLibraryItemForm
            onSuccess={() => setReloadToken((token) => token + 1)}
          />
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import { Home, Search, User, type LucideProps } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getActiveNavId, getNavItems, type NavItemId } from '../lib/app-nav';
import { getCurrentUser, type AuthUser } from '../lib/auth';

const NAV_ICONS: Record<NavItemId, ComponentType<LucideProps>> = {
  home: Home,
  search: Search,
  profile: User,
};

export function AppNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const current = await getCurrentUser();
      if (!cancelled) {
        setUser(current);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const items = getNavItems(user);
  const activeId = getActiveNavId(pathname);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface',
        'md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b',
      )}
      aria-label="Основное меню"
    >
      <ul
        className={cn(
          'mx-auto my-0 flex max-w-[40rem] list-none items-stretch justify-around p-0',
          'px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] pt-[0.35rem]',
          'md:max-w-none md:justify-start md:gap-2 md:px-5 md:py-2',
        )}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = NAV_ICONS[item.id];
          return (
            <li key={item.id}>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  'h-auto min-h-11 gap-1.5 rounded-md px-3 py-1.5 font-sans text-[0.9rem] no-underline',
                  'text-muted hover:bg-transparent hover:text-foreground',
                  'md:min-h-10',
                  isActive &&
                    'font-semibold text-foreground underline underline-offset-[0.2em]',
                )}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    aria-hidden
                    className="size-4 shrink-0"
                    strokeWidth={1.75}
                  />
                  <span>{item.label}</span>
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

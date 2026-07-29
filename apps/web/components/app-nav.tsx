'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import {
  Home,
  Layers,
  Search,
  Trophy,
  User,
  type LucideProps,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getActiveNavId,
  getNavAuthAction,
  getNavItems,
  type NavItemId,
} from '../lib/app-nav';
import { getCurrentUser, logout, type AuthUser } from '../lib/auth';

const NAV_ICONS: Record<NavItemId, ComponentType<LucideProps>> = {
  home: Home,
  search: Search,
  rankings: Trophy,
  collections: Layers,
  profile: User,
};

const navItemClassName = cn(
  'h-auto w-full min-h-11 flex-col gap-0.5 rounded-md px-0.5 py-1 font-sans text-[0.65rem] leading-tight no-underline',
  'whitespace-normal text-muted hover:bg-transparent hover:text-foreground',
  'md:w-auto md:min-h-10 md:flex-row md:gap-1.5 md:px-3 md:py-1.5 md:text-[0.9rem] md:leading-normal md:whitespace-nowrap',
);

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

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
  const authAction = getNavAuthAction(user);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logout();
      setUser(null);
      router.push('/login');
      router.refresh();
    } finally {
      setLogoutLoading(false);
    }
  }

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
          'px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))] pt-[0.35rem]',
          'md:max-w-none md:justify-start md:gap-2 md:px-5 md:py-2',
        )}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = NAV_ICONS[item.id];
          return (
            <li key={item.id} className="min-w-0 flex-1 md:flex-none">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  navItemClassName,
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
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              </Button>
            </li>
          );
        })}
        <li className="min-w-0 flex-1 md:ml-auto md:flex-none">
          {authAction.kind === 'login' ? (
            <Button asChild variant="ghost" className={navItemClassName}>
              <Link href={authAction.href}>
                <span className="max-w-full truncate">{authAction.label}</span>
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={logoutLoading}
              className={navItemClassName}
              onClick={() => {
                void handleLogout();
              }}
            >
              <span className="max-w-full truncate">
                {logoutLoading ? 'Выход…' : authAction.label}
              </span>
            </Button>
          )}
        </li>
      </ul>
    </nav>
  );
}

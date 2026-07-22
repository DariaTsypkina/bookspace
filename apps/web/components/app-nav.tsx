'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getActiveNavId, getNavItems } from '../lib/app-nav';
import { getCurrentUser, type AuthUser } from '../lib/auth';

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
    <nav className="app-nav" aria-label="Основное меню">
      <ul className="app-nav-list">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={
                  isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link'
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

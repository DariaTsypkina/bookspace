import type { AuthUser } from './auth';

export type NavItemId = 'home' | 'search' | 'profile';

export type NavItem = {
  id: NavItemId;
  label: string;
  href: string;
};

export function profileNavHref(user: AuthUser | null): string {
  return user ? '/library' : '/login';
}

export function getNavItems(user: AuthUser | null): NavItem[] {
  return [
    { id: 'home', label: 'Главная', href: '/' },
    { id: 'search', label: 'Поиск', href: '/search' },
    { id: 'profile', label: 'Профиль', href: profileNavHref(user) },
  ];
}

export function getActiveNavId(pathname: string): NavItemId | null {
  const path = pathname.split('?')[0] ?? pathname;

  if (path === '/') {
    return 'home';
  }
  if (path === '/search' || path.startsWith('/search/')) {
    return 'search';
  }
  if (
    path === '/login' ||
    path === '/register' ||
    path === '/library' ||
    path.startsWith('/library/')
  ) {
    return 'profile';
  }
  return null;
}

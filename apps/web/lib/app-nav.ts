import type { AuthUser } from './auth';

export type NavItemId =
  'home' | 'search' | 'rankings' | 'collections' | 'profile';

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
    { id: 'rankings', label: 'Рейтинги', href: '/rankings' },
    { id: 'collections', label: 'Подборки', href: '/collections' },
    { id: 'profile', label: 'Профиль', href: profileNavHref(user) },
  ];
}

export function getActiveNavId(pathname: string): NavItemId | null {
  const path = pathname.split('?')[0] ?? pathname;

  // Admin routes are outside the tab-bar IA — never highlight a public tab.
  if (path === '/admin' || path.startsWith('/admin/')) {
    return null;
  }

  if (path === '/') {
    return 'home';
  }
  if (path === '/search' || path.startsWith('/search/')) {
    return 'search';
  }
  if (path === '/rankings' || path.startsWith('/rankings/')) {
    return 'rankings';
  }
  if (path === '/collections' || path.startsWith('/collections/')) {
    return 'collections';
  }
  if (
    path === '/login' ||
    path === '/register' ||
    path === '/library' ||
    path.startsWith('/library/') ||
    path.startsWith('/u/')
  ) {
    return 'profile';
  }
  return null;
}

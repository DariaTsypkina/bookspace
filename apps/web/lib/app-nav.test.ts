import { describe, expect, it } from 'vitest';
import {
  getActiveNavId,
  getNavAuthAction,
  getNavItems,
  profileNavHref,
  type NavItemId,
} from './app-nav';

describe('getNavAuthAction', () => {
  it('returns login link for guest', () => {
    expect(getNavAuthAction(null)).toEqual({
      kind: 'login',
      label: 'Войти',
      href: '/login',
    });
  });

  it('returns logout action for USER', () => {
    expect(
      getNavAuthAction({
        id: 'u1',
        email: 'reader@bookspace.local',
        role: 'USER',
        slug: 'reader',
      }),
    ).toEqual({
      kind: 'logout',
      label: 'Выйти',
    });
  });

  it('returns logout action for ADMIN (same as USER; admin not a nav destination)', () => {
    expect(
      getNavAuthAction({
        id: 'a1',
        email: 'admin@bookspace.local',
        role: 'ADMIN',
        slug: 'admin',
      }),
    ).toEqual({
      kind: 'logout',
      label: 'Выйти',
    });
  });

  it('does not introduce a sixth tab id or /admin href', () => {
    const guest = getNavAuthAction(null);
    const user = getNavAuthAction({
      id: 'u1',
      email: 'reader@bookspace.local',
      role: 'USER',
      slug: 'reader',
    });
    expect(guest).not.toHaveProperty('id');
    expect(user).not.toHaveProperty('id');
    expect(guest.kind === 'login' ? guest.href : '').not.toMatch(/^\/admin/);
  });
});

describe('profileNavHref', () => {
  it('sends guest to /login', () => {
    expect(profileNavHref(null)).toBe('/login');
  });

  it('sends USER to /library', () => {
    expect(
      profileNavHref({
        id: 'u1',
        email: 'reader@bookspace.local',
        role: 'USER',
        slug: 'reader',
      }),
    ).toBe('/library');
  });

  it('sends ADMIN to /library (admin is not a menu destination)', () => {
    expect(
      profileNavHref({
        id: 'a1',
        email: 'admin@bookspace.local',
        role: 'ADMIN',
        slug: 'admin',
      }),
    ).toBe('/library');
  });
});

describe('getNavItems', () => {
  it('returns exactly Главная · Поиск · Рейтинги · Подборки · Профиль for guest', () => {
    const items = getNavItems(null);
    expect(items.map((item) => item.id)).toEqual([
      'home',
      'search',
      'rankings',
      'collections',
      'profile',
    ]);
    expect(items.map((item) => item.label)).toEqual([
      'Главная',
      'Поиск',
      'Рейтинги',
      'Подборки',
      'Профиль',
    ]);
    expect(items.map((item) => item.href)).toEqual([
      '/',
      '/search',
      '/rankings',
      '/collections',
      '/login',
    ]);
  });

  it('points Профиль to /library for authenticated USER', () => {
    const items = getNavItems({
      id: 'u1',
      email: 'reader@bookspace.local',
      role: 'USER',
      slug: 'reader',
    });
    expect(items).toHaveLength(5);
    expect(items.find((item) => item.id === 'profile')?.href).toBe('/library');
  });

  it('points Профиль to /library for ADMIN (no Admin menu item)', () => {
    const items = getNavItems({
      id: 'a1',
      email: 'admin@bookspace.local',
      role: 'ADMIN',
      slug: 'admin',
    });
    expect(items).toHaveLength(5);
    expect(items.some((item) => /admin/i.test(item.label))).toBe(false);
    expect(items.some((item) => item.href.startsWith('/admin'))).toBe(false);
    expect(items.find((item) => item.id === 'profile')?.href).toBe('/library');
  });
});

describe('getActiveNavId', () => {
  it.each<[string, NavItemId | null]>([
    ['/', 'home'],
    ['/search', 'search'],
    ['/search?q=гарри', 'search'],
    ['/rankings', 'rankings'],
    ['/rankings/best-2024', 'rankings'],
    ['/collections', 'collections'],
    ['/collections/summer', 'collections'],
    ['/login', 'profile'],
    ['/register', 'profile'],
    ['/library', 'profile'],
    ['/library/shelves', 'profile'],
    ['/u/demo-reader', 'profile'],
    ['/books/harry-potter', null],
    ['/admin', null],
    ['/admin/context', null],
    ['/admin/rankings', null],
  ])('maps %s → %s', (pathname, expected) => {
    expect(getActiveNavId(pathname)).toBe(expected);
  });
});

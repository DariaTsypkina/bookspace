import { describe, expect, it } from 'vitest';
import {
  getActiveNavId,
  getNavItems,
  profileNavHref,
  type NavItemId,
} from './app-nav';

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
  it('returns exactly Главная · Поиск · Профиль for guest', () => {
    const items = getNavItems(null);
    expect(items.map((item) => item.id)).toEqual(['home', 'search', 'profile']);
    expect(items.map((item) => item.label)).toEqual([
      'Главная',
      'Поиск',
      'Профиль',
    ]);
    expect(items.map((item) => item.href)).toEqual(['/', '/search', '/login']);
  });

  it('points Профиль to /library for authenticated USER', () => {
    const items = getNavItems({
      id: 'u1',
      email: 'reader@bookspace.local',
      role: 'USER',
      slug: 'reader',
    });
    expect(items.find((item) => item.id === 'profile')?.href).toBe('/library');
  });

  it('points Профиль to /library for ADMIN (no Admin menu item)', () => {
    const items = getNavItems({
      id: 'a1',
      email: 'admin@bookspace.local',
      role: 'ADMIN',
      slug: 'admin',
    });
    expect(items).toHaveLength(3);
    expect(items.some((item) => /admin/i.test(item.label))).toBe(false);
    expect(items.some((item) => item.href.startsWith('/admin'))).toBe(false);
    expect(items.find((item) => item.id === 'profile')?.href).toBe('/library');
  });

  it('does not include Рейтинги or Подборки', () => {
    const labels = getNavItems(null).map((item) => item.label);
    expect(labels).not.toContain('Рейтинги');
    expect(labels).not.toContain('Подборки');
  });
});

describe('getActiveNavId', () => {
  it.each<[string, NavItemId | null]>([
    ['/', 'home'],
    ['/search', 'search'],
    ['/search?q=гарри', 'search'],
    ['/login', 'profile'],
    ['/register', 'profile'],
    ['/library', 'profile'],
    ['/library/shelves', 'profile'],
    ['/books/harry-potter', null],
    ['/admin/context', null],
    ['/u/demo-reader', null],
  ])('maps %s → %s', (pathname, expected) => {
    expect(getActiveNavId(pathname)).toBe(expected);
  });
});

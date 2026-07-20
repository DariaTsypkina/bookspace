import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentUser,
  login,
  profilePath,
  register,
  validatePassword,
} from './auth';

describe('validatePassword', () => {
  it('accepts strong passwords', () => {
    expect(validatePassword('User123!')).toBeNull();
  });

  it('returns error for weak passwords', () => {
    expect(validatePassword('weak')).toBeTruthy();
  });
});

describe('profilePath', () => {
  it('builds public profile URL from slug', () => {
    expect(profilePath('daria')).toBe('/u/daria');
  });
});

describe('register', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts credentials to API register endpoint', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        email: 'new@example.com',
        role: 'USER',
        slug: 'new',
      }),
    } as Response);

    const result = await register('new@example.com', 'Secure123!');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'Secure123!',
        }),
      }),
    );
    expect(result.email).toBe('new@example.com');
    expect(result.slug).toBe('new');
  });

  it('throws with API error message on failure', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Пользователь с таким email уже существует',
      }),
    } as Response);

    await expect(register('taken@example.com', 'Secure123!')).rejects.toThrow(
      'Пользователь с таким email уже существует',
    );
  });
});

describe('login', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts credentials to API login endpoint', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          id: '1',
          email: 'user@bookspace.local',
          role: 'USER',
          slug: 'user',
        },
      }),
    } as Response);

    const result = await login('user@bookspace.local', 'User123!');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
    expect(result.user.email).toBe('user@bookspace.local');
    expect(result.user.slug).toBe('user');
  });
});

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns user when session cookie is valid', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        email: 'user@bookspace.local',
        role: 'USER',
        slug: 'user',
      }),
    } as Response);

    const user = await getCurrentUser();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/me',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
    expect(user).toEqual({
      id: '1',
      email: 'user@bookspace.local',
      role: 'USER',
      slug: 'user',
    });
  });

  it('returns null for guest (unauthorized)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

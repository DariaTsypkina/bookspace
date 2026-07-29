import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, api } from './http';
import {
  getCurrentUser,
  login,
  logout,
  profilePath,
  register,
  validatePassword,
} from './auth';

vi.mock('./http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./http')>();
  return {
    ...actual,
    api: {
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

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
    vi.mocked(api.post).mockReset();
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('posts credentials via api instance to BFF register', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        id: '1',
        email: 'new@example.com',
        role: 'USER',
        slug: 'new',
      },
    });

    const result = await register('new@example.com', 'Secure123!');

    expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
      email: 'new@example.com',
      password: 'Secure123!',
    });
    expect(result.email).toBe('new@example.com');
    expect(result.slug).toBe('new');
  });

  it('rethrows ApiError from api on failure', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError(409, 'Пользователь с таким email уже существует'),
    );

    await expect(register('taken@example.com', 'Secure123!')).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 409 &&
        err.message === 'Пользователь с таким email уже существует',
    );
  });
});

describe('login', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('posts credentials via api instance to BFF login', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'user@bookspace.local',
          role: 'USER',
          slug: 'user',
        },
      },
    });

    const result = await login('user@bookspace.local', 'User123!');

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'user@bookspace.local',
      password: 'User123!',
    });
    expect(result.user.email).toBe('user@bookspace.local');
    expect(result.user.slug).toBe('user');
  });
});

describe('logout', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('posts via api instance to BFF logout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });

    await logout();

    expect(api.post).toHaveBeenCalledWith('/api/auth/logout');
  });
});

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns user when session cookie is valid', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        id: '1',
        email: 'user@bookspace.local',
        role: 'USER',
        slug: 'user',
      },
    });

    const user = await getCurrentUser();

    expect(api.get).toHaveBeenCalledWith('/api/auth/me');
    expect(user).toEqual({
      id: '1',
      email: 'user@bookspace.local',
      role: 'USER',
      slug: 'user',
    });
  });

  it('returns null for guest (unauthorized ApiError)', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(401, 'Unauthorized'));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('returns null on other ApiError statuses', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError(500, 'Server error'));

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

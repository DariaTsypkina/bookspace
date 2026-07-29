import { ApiError, api } from './http';

const AUTH_BFF_BASE = '/api/auth';

export type AuthUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  slug: string;
};

export function profilePath(slug: string): string {
  return `/u/${slug}`;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Пароль должен быть не короче 8 символов';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Пароль должен содержать заглавную букву';
  }
  if (!/[a-z]/.test(password)) {
    return 'Пароль должен содержать строчную букву';
  }
  if (!/[0-9]/.test(password)) {
    return 'Пароль должен содержать цифру';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Пароль должен содержать спецсимвол';
  }
  return null;
}

export async function register(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>(`${AUTH_BFF_BASE}/register`, {
    email,
    password,
  });
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const { data } = await api.post<{ user: AuthUser }>(
    `${AUTH_BFF_BASE}/login`,
    { email, password },
  );
  return data;
}

export async function logout(): Promise<void> {
  await api.post(`${AUTH_BFF_BASE}/logout`);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<AuthUser>(`${AUTH_BFF_BASE}/me`);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      return null;
    }
    throw error;
  }
}

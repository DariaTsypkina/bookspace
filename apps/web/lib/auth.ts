const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type AuthUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

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

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // ignore json parse errors
  }
  return 'Произошла ошибка. Попробуйте снова.';
}

export async function register(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as AuthUser;
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as { user: AuthUser };
}

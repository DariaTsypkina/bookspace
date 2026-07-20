'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { GuestOnly } from '../../components/guest-only';
import { login } from '../../lib/auth';

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Не удалось войти',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>Вход</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p role="alert" className="auth-error">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>
      </form>
      <p className="auth-divider">или</p>
      <div className="auth-oauth-list">
        {/* Full navigation required for OAuth redirect + Set-Cookie via BFF */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="auth-oauth" href="/api/auth/google">
          Войти через Google
        </a>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="auth-oauth" href="/api/auth/yandex">
          Войти через Яндекс
        </a>
      </div>
      <p>
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}

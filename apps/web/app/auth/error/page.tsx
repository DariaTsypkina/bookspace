'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function providerLabel(provider: string | null): string {
  if (provider === 'yandex') return 'Яндекс';
  if (provider === 'google') return 'Google';
  return 'внешний аккаунт';
}

function messageFor(reason: string, provider: string | null): string {
  const name = providerLabel(provider);
  switch (reason) {
    case 'access_denied':
      return `Вход через ${name} отменён.`;
    case 'missing_code':
      return `Не удалось завершить вход через ${name}: отсутствует код авторизации.`;
    case 'oauth_error':
      return `Ошибка авторизации ${name === 'внешний аккаунт' ? 'OAuth' : name}. Попробуйте ещё раз.`;
    case 'oauth_failed':
      return `Не удалось войти через ${name}. Попробуйте ещё раз или войдите по email.`;
    default:
      return 'Не удалось войти. Попробуйте ещё раз или войдите по email.';
  }
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'oauth_error';
  const provider = searchParams.get('provider');
  const message = messageFor(reason, provider);

  return (
    <main className="auth-page">
      <h1>Ошибка входа</h1>
      <p role="alert" className="auth-error">
        {message}
      </p>
      <p>
        <Link href="/login">Вернуться ко входу</Link>
      </p>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <h1>Ошибка входа</h1>
        </main>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}

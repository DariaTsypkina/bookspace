'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const REASON_MESSAGES: Record<string, string> = {
  access_denied: 'Вход через Google отменён.',
  missing_code:
    'Не удалось завершить вход через Google: отсутствует код авторизации.',
  oauth_error: 'Ошибка авторизации Google. Попробуйте ещё раз.',
  oauth_failed:
    'Не удалось войти через Google. Попробуйте ещё раз или войдите по email.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'oauth_error';
  const message =
    REASON_MESSAGES[reason] ??
    'Не удалось войти. Попробуйте ещё раз или войдите по email.';

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

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { GuestOnly } from '../../components/guest-only';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register, validatePassword } from '../../lib/auth';

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      router.push('/login');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось зарегистрироваться',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
      <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
        Регистрация
      </h1>
      <Card className="w-full">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Label htmlFor="email" className="font-normal text-muted">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Label htmlFor="password" className="font-normal text-muted">
              Пароль
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? (
              <p role="alert" className="text-sm text-[color:var(--error)]">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Регистрация…' : 'Зарегистрироваться'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted">или</p>
      <div className="flex w-full flex-col gap-2">
        {/* Full navigation required for OAuth redirect + Set-Cookie via BFF */}
        <Button asChild variant="outline" className="w-full">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/auth/google">Войти через Google</a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/auth/yandex">Войти через Яндекс</a>
        </Button>
      </div>
      <p className="text-[0.95rem] text-muted">
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  );
}

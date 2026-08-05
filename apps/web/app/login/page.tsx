'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginInputSchema } from '@bookspace/schemas';
import { useForm } from 'react-hook-form';
import { GuestOnly } from '../../components/guest-only';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '../../components/auth-provider';
import { getFriendlyZodIssueMessage } from '@/lib/form-errors';
import { login } from '../../lib/auth';
import { toUserFacingErrorMessage } from '@/lib/user-facing-errors';

type LoginFormValues = {
  email: string;
  password: string;
};

function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleValidSubmit(values: LoginFormValues) {
    form.clearErrors('root');

    try {
      const result = await login(values.email, values.password);
      setUser(result.user);
      router.push('/');
    } catch (submitError) {
      form.setError('root', {
        message:
          submitError instanceof Error
            ? toUserFacingErrorMessage(submitError.message)
            : 'Не удалось войти',
      });
    }
  }

  function handleInvalidSubmit() {
    const result = LoginInputSchema.safeParse(form.getValues());
    if (result.success) {
      return;
    }
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];
      if (fieldName === 'email' || fieldName === 'password') {
        form.setError(fieldName, {
          type: issue.code,
          message: getFriendlyZodIssueMessage(issue),
        });
      }
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
      <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
        Вход
      </h1>
      <Card className="w-full">
        <CardContent className="p-5">
          <Form {...form}>
            <form
              method="post"
              action="/api/login"
              onSubmit={form.handleSubmit(
                handleValidSubmit,
                handleInvalidSubmit,
              )}
              className="flex flex-col gap-3"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal text-muted">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-normal text-muted">
                      Пароль
                    </FormLabel>
                    <PasswordInput autoComplete="current-password" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message ? (
                <p role="alert" className="text-sm text-[color:var(--error)]">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="mt-2 w-full"
              >
                {form.formState.isSubmitting ? 'Вход…' : 'Войти'}
              </Button>
            </form>
          </Form>
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

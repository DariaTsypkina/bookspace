'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import {
  ADMIN_DASHBOARD_QUICK_ACTIONS,
  fetchAdminDashboardSummary,
  type AdminDashboardSummary,
} from '@/lib/admin-dashboard';
import { cn } from '@/lib/utils';

type CounterCardProps = {
  title: string;
  value: number | null;
  description: string;
  href?: string;
};

function CounterCard({ title, value, description, href }: CounterCardProps) {
  const body = (
    <>
      <CardHeader className="pb-2">
        <CardDescription className="font-sans text-sm text-muted">
          {title}
        </CardDescription>
        <CardTitle className="font-sans text-3xl font-normal tabular-nums tracking-tight text-foreground">
          {value === null ? '—' : value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-sans text-sm text-muted">{description}</p>
      </CardContent>
    </>
  );

  if (!href) {
    return <Card className="h-full">{body}</Card>;
  }

  return (
    <Link
      href={href}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-colors hover:border-accent">
        {body}
      </Card>
    </Link>
  );
}

export function AdminDashboardPanel() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDashboardSummary();
      setSummary(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить сводку',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSummary();
    });
  }, [loadSummary]);

  const days = summary?.recentContextDays ?? 7;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-12 pt-8">
      <header>
        <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
          Админ-дашборд
        </h1>
        <p className="mt-2 font-sans text-[0.95rem] text-muted">
          Сводка очередей и быстрый переход к разделам админки.
        </p>
      </header>

      {error ? (
        <p role="alert" className="font-sans text-sm text-[color:var(--error)]">
          {error}
        </p>
      ) : null}

      {loading && !summary ? (
        <p aria-live="polite" className="font-sans text-muted">
          Загрузка…
        </p>
      ) : (
        <section
          aria-label="Счётчики"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <CounterCard
            title="MatchQueue OPEN"
            value={summary?.matchQueueOpen ?? null}
            description="Очередь не сматченных записей"
            href="/admin/match-queue"
          />
          <CounterCard
            title={`ContextReading за ${days} дн.`}
            value={summary?.recentContext ?? null}
            description="Свежие auto-published записи"
            href="/admin/context"
          />
          <CounterCard
            title="Failed jobs"
            value={summary?.failedJobs ?? null}
            description="Провалившиеся задачи BullMQ"
          />
        </section>
      )}

      <section aria-label="Быстрые действия" className="flex flex-col gap-3">
        <h2 className="text-lg font-normal tracking-[0.02em] text-foreground">
          Быстрые действия
        </h2>
        <ul className="m-0 flex list-none flex-col gap-3 p-0 sm:flex-row sm:flex-wrap">
          {ADMIN_DASHBOARD_QUICK_ACTIONS.map((action) => (
            <li key={action.href} className="sm:min-w-[12rem] sm:flex-1">
              <Link
                href={action.href}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-auto w-full flex-col items-start gap-1 whitespace-normal px-4 py-3 text-left font-sans',
                )}
              >
                <span className="text-sm text-foreground">{action.label}</span>
                <span className="text-xs font-normal text-muted">
                  {action.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

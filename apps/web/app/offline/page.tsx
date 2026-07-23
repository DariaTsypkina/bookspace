import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
      <Card className="w-full border-border bg-surface shadow-none">
        <CardHeader className="items-center gap-3 pb-2">
          <WifiOff className="size-8 text-muted" aria-hidden />
          <h1 className="text-center text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
            Нет сети
          </h1>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-0">
          <p className="text-center text-[0.95rem] leading-relaxed text-muted">
            Страница недоступна офлайн. Проверьте подключение или откройте
            недавно посещённую страницу из кэша.
          </p>
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link href="/">На главную</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

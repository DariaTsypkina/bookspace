import { Card, CardContent } from '@/components/ui/card';

export default function RankingsStubPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        Рейтинги
      </h1>
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            Публичные рейтинги скоро появятся.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

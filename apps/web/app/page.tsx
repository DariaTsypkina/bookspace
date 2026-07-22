import { Card, CardHeader } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="items-center p-0">
          <h1 className="text-[1.75rem] font-normal tracking-[0.02em] text-foreground">
            Главная
          </h1>
        </CardHeader>
      </Card>
    </main>
  );
}

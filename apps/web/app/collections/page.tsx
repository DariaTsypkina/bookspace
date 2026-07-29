import { Card, CardContent } from '@/components/ui/card';
import { COLLECTIONS_STUB_COPY } from '@/lib/collections';

export default function CollectionsStubPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        Подборки
      </h1>
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">{COLLECTIONS_STUB_COPY}</p>
        </CardContent>
      </Card>
    </main>
  );
}

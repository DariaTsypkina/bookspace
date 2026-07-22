import { LogoutButton } from '@/components/logout-button';
import { Card, CardContent } from '@/components/ui/card';

type ProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProfileStubPage({ params }: ProfilePageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-8 pt-5">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-[0.02em] text-foreground">
        Профиль
      </h1>
      <Card>
        <CardContent className="flex flex-col gap-4 px-4 py-3.5 font-sans">
          <p className="text-[0.95rem] text-muted">
            Публичный профиль пользователя{' '}
            <strong className="font-medium text-foreground">{slug}</strong>{' '}
            скоро появится.
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </main>
  );
}

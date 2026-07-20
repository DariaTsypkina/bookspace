import { LogoutButton } from '../../../components/logout-button';

type ProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProfileStubPage({ params }: ProfilePageProps) {
  const { slug } = await params;

  return (
    <main className="profile-stub">
      <h1>Профиль</h1>
      <p>
        Публичный профиль пользователя <strong>{slug}</strong> скоро появится.
      </p>
      <LogoutButton />
    </main>
  );
}

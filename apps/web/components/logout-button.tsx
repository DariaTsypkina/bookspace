import { Button } from '@/components/ui/button';

/**
 * Progressive logout (bd-6b7.11): native form POST → `/logout` → 303 `/login`.
 * Works on mobile even when client click handlers / hydration are broken.
 */
export function LogoutButton() {
  return (
    <form action="/api/logout" method="post" className="self-start">
      <Button
        type="submit"
        variant="outline"
        className="min-h-11 cursor-pointer self-start font-sans"
      >
        Выйти
      </Button>
    </form>
  );
}

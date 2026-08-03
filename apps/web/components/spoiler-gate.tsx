'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  hasClientSpoilersConsent,
  persistSpoilersConsent,
  SPOILERS_OK_COOKIE,
  SPOILERS_OK_VALUE,
} from '@/lib/spoiler-gate';

type SpoilerGateProps = {
  initialAccepted: boolean;
  children: React.ReactNode;
};

function readClientConsent(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return hasClientSpoilersConsent({
    cookieHeader: document.cookie,
    storage: typeof localStorage !== 'undefined' ? localStorage : null,
  });
}

/** Cross-tab storage updates; same-tab accept uses optimistic state. */
function subscribeSpoilersConsent(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getServerSnapshot(): boolean {
  return false;
}

export function SpoilerGate({ initialAccepted, children }: SpoilerGateProps) {
  // Match SSR via getServerSnapshot=false; after hydration getSnapshot may
  // pick up localStorage when cookie was dropped (iOS). No setState-in-effect.
  const storeConsent = useSyncExternalStore(
    subscribeSpoilersConsent,
    readClientConsent,
    getServerSnapshot,
  );
  const [optimisticAccepted, setAccepted] = useState(false);
  const accepted = initialAccepted || storeConsent || optimisticAccepted;

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="px-4 py-4">
        <section
          aria-label="Предупреждение о спойлерах"
          className="flex flex-col gap-3"
        >
          <p className="font-sans text-[0.95rem] text-muted">
            Могут быть спойлеры
          </p>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer self-start font-sans"
            onClick={() => {
              setAccepted(true);
              persistSpoilersConsent();
            }}
          >
            Показать
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}

export { SPOILERS_OK_COOKIE, SPOILERS_OK_VALUE };

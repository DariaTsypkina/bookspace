'use client';

import { useEffect, useState } from 'react';
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

export function SpoilerGate({ initialAccepted, children }: SpoilerGateProps) {
  // Match SSR: do not read localStorage during first client render (hydration).
  const [accepted, setAccepted] = useState(initialAccepted);

  useEffect(() => {
    if (initialAccepted) {
      return;
    }
    if (readClientConsent()) {
      setAccepted(true);
    }
  }, [initialAccepted]);

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

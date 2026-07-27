'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  buildSpoilersOkCookie,
  hasSpoilersConsent,
  SPOILERS_OK_COOKIE,
  SPOILERS_OK_VALUE,
} from '@/lib/spoiler-gate';

type SpoilerGateProps = {
  initialAccepted: boolean;
  children: React.ReactNode;
};

function readSpoilersCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const entry = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${SPOILERS_OK_COOKIE}=`));

  if (!entry) {
    return false;
  }

  const value = entry.split('=')[1];
  return hasSpoilersConsent(value);
}

function persistSpoilersConsent(): void {
  document.cookie = buildSpoilersOkCookie();
}

export function SpoilerGate({ initialAccepted, children }: SpoilerGateProps) {
  const [accepted, setAccepted] = useState(
    initialAccepted || readSpoilersCookie(),
  );

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
            className="self-start"
            onClick={() => {
              persistSpoilersConsent();
              setAccepted(true);
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

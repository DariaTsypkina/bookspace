'use client';

import { useState } from 'react';
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
    <section className="spoiler-gate" aria-label="Предупреждение о спойлерах">
      <p className="spoiler-gate-warning">Могут быть спойлеры</p>
      <button
        type="button"
        className="spoiler-gate-button"
        onClick={() => {
          persistSpoilersConsent();
          setAccepted(true);
        }}
      >
        Показать
      </button>
    </section>
  );
}

export { SPOILERS_OK_COOKIE, SPOILERS_OK_VALUE };

/**
 * Minimal beforeinstallprompt helper (no third-party libs).
 * iOS Safari does not fire this event — use Add to Home Screen instead.
 */

export type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

let deferredPrompt: BeforeInstallPromptEventLike | null = null;

export function getDeferredInstallPrompt(): BeforeInstallPromptEventLike | null {
  return deferredPrompt;
}

export function clearDeferredInstallPrompt(): void {
  deferredPrompt = null;
}

export function captureInstallPrompt(
  event: Event,
): BeforeInstallPromptEventLike {
  event.preventDefault();
  const promptEvent = event as BeforeInstallPromptEventLike;
  deferredPrompt = promptEvent;
  return promptEvent;
}

export async function promptPwaInstall(): Promise<
  'accepted' | 'dismissed' | 'unavailable'
> {
  const promptEvent = deferredPrompt;
  if (!promptEvent) {
    return 'unavailable';
  }
  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  deferredPrompt = null;
  return outcome;
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  const media = window.matchMedia('(display-mode: standalone)');
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media.matches || iosStandalone;
}

import { describe, expect, it } from 'vitest';
import {
  captureInstallPrompt,
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  isStandaloneDisplayMode,
  promptPwaInstall,
} from './install-prompt';

function makePromptEvent(
  outcome: 'accepted' | 'dismissed' = 'accepted',
): Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  preventDefault: () => void;
} {
  return {
    prompt: async () => undefined,
    userChoice: Promise.resolve({ outcome, platform: 'web' }),
    preventDefault() {
      /* noop */
    },
  } as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    preventDefault: () => void;
  };
}

describe('PWA install prompt helper (bd-6b7.1)', () => {
  it('captures and clears deferred beforeinstallprompt', async () => {
    clearDeferredInstallPrompt();
    expect(getDeferredInstallPrompt()).toBeNull();

    const event = makePromptEvent('accepted');
    captureInstallPrompt(event);
    expect(getDeferredInstallPrompt()).toBe(event);

    await expect(promptPwaInstall()).resolves.toBe('accepted');
    expect(getDeferredInstallPrompt()).toBeNull();
  });

  it('returns unavailable when no deferred prompt', async () => {
    clearDeferredInstallPrompt();
    await expect(promptPwaInstall()).resolves.toBe('unavailable');
  });

  it('detects non-standalone in node/test env', () => {
    expect(isStandaloneDisplayMode()).toBe(false);
  });
});

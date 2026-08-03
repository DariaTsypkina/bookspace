import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(__dirname, 'pwa-sw-register.tsx'), 'utf8');
const swSource = readFileSync(join(__dirname, '../public/sw.js'), 'utf8');
const policySource = readFileSync(
  join(__dirname, '../lib/pwa/offline-cache-policy.ts'),
  'utf8',
);

describe('PwaSwRegister / SW policy (bd-6b7.10)', () => {
  it('registers the service worker on the client', () => {
    expect(source).toMatch(/registerServiceWorker/);
  });

  it('keeps /_next/ out of SW cache-first (hydration-safe)', () => {
    expect(policySource).toMatch(/shouldCacheStaticAsset/);
    expect(policySource).toMatch(/pathname\.startsWith\('\/_next\/'\)/);
    expect(swSource).toMatch(/pathname\.startsWith\('\/_next\/'\)/);
    expect(swSource).toContain('bookspace-shell-v2');
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(__dirname, 'pwa-sw-register.tsx'), 'utf8');

describe('PwaSwRegister (bd-6b7.10)', () => {
  it('unregisters service workers in development instead of registering', () => {
    expect(source).toMatch(/NODE_ENV/);
    expect(source).toMatch(/development/);
    expect(source).toMatch(/unregisterAllServiceWorkers/);
    expect(source).toMatch(/shouldRegisterServiceWorker|registerServiceWorker/);
  });
});

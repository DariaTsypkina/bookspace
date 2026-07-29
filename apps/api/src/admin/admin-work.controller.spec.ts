import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('AdminWorkController Zod migration', () => {
  const source = readFileSync(
    join(__dirname, 'admin-work.controller.ts'),
    'utf8',
  );

  it('uses shared Zod DTO for needs-context patch and no class-validator', () => {
    expect(source).toMatch(/AdminWorkNeedsContextPatchDto/);
    expect(source).not.toMatch(/class-validator/);
    expect(source).not.toMatch(/@IsEnum/);
    expect(source).not.toMatch(/class PatchNeedsContextDto/);
  });
});

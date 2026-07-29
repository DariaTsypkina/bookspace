import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('MeLibraryController Zod migration', () => {
  const source = readFileSync(
    join(__dirname, 'me-library.controller.ts'),
    'utf8',
  );

  it('uses shared Zod DTO for add item and no class-validator', () => {
    expect(source).toMatch(/AddLibraryItemDto/);
    expect(source).not.toMatch(/class-validator/);
    expect(source).not.toMatch(/@IsOptional/);
    expect(source).not.toMatch(/@IsString/);
    expect(source).not.toMatch(/@MaxLength/);
    expect(source).not.toMatch(/class AddLibraryItemDto/);
  });
});

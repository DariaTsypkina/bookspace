import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('MeLibraryController Zod migration', () => {
  const source = readFileSync(
    join(__dirname, 'me-library.controller.ts'),
    'utf8',
  );

  it('uses shared Zod DTO for upsert/patch and no class-validator', () => {
    expect(source).toMatch(/UpsertUserBookDto/);
    expect(source).toMatch(/PutUserBookBySlugDto/);
    expect(source).toMatch(/PatchUserBookDto/);
    expect(source).toMatch(/MeLibraryService/);
    expect(source).not.toMatch(/class-validator/);
    expect(source).not.toMatch(/@IsOptional/);
    expect(source).not.toMatch(/@IsString/);
    expect(source).not.toMatch(/@MaxLength/);
    expect(source).not.toMatch(/class UpsertUserBookDto/);
  });
});

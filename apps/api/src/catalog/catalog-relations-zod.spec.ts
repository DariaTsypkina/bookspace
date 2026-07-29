import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CharacterRelationTypeSchema,
  SpoilersConsentInputSchema,
  SpoilersOkCookieValueSchema,
  WorkRelationTypeSchema,
} from '@bookspace/schemas';

describe('Relations/Spoiler Zod shared contracts (bd-0t0.9)', () => {
  const typesSource = readFileSync(
    path.join(__dirname, 'catalog-character.types.ts'),
    'utf8',
  );
  const characterServiceSource = readFileSync(
    path.join(__dirname, 'catalog-character.service.ts'),
    'utf8',
  );
  const characterControllerSource = readFileSync(
    path.join(__dirname, 'catalog-character.controller.ts'),
    'utf8',
  );

  it('exports spoiler cookie and relation type schemas', () => {
    expect(SpoilersOkCookieValueSchema.safeParse('1').success).toBe(true);
    expect(SpoilersOkCookieValueSchema.safeParse('0').success).toBe(false);
    expect(SpoilersConsentInputSchema.safeParse({ value: '1' }).success).toBe(
      true,
    );
    expect(SpoilersConsentInputSchema.safeParse({ value: 'yes' }).success).toBe(
      false,
    );
    for (const type of ['FRIEND', 'ENEMY', 'FAMILY', 'RELATED'] as const) {
      expect(CharacterRelationTypeSchema.safeParse(type).success).toBe(true);
    }
    expect(CharacterRelationTypeSchema.safeParse('ALLY').success).toBe(false);
    for (const type of [
      'SEQUEL',
      'PREQUEL',
      'RELATED',
      'ADAPTATION',
    ] as const) {
      expect(WorkRelationTypeSchema.safeParse(type).success).toBe(true);
    }
    expect(WorkRelationTypeSchema.safeParse('SPINOFF').success).toBe(false);
  });

  it('catalog-character types import CharacterRelationType from shared schemas', () => {
    expect(typesSource).toMatch(/from ['"]@bookspace\/schemas['"]/);
    expect(typesSource).toMatch(/CharacterRelationType/);
    expect(typesSource).not.toMatch(
      /export type CharacterRelationType = 'FRIEND'/,
    );
  });

  it('relations/spoiler domain has no class-validator DTO', () => {
    for (const source of [
      typesSource,
      characterServiceSource,
      characterControllerSource,
    ]) {
      expect(source).not.toMatch(/class-validator/);
      expect(source).not.toMatch(/@IsString/);
      expect(source).not.toMatch(/@IsEnum/);
      expect(source).not.toMatch(/@IsOptional/);
    }
  });
});

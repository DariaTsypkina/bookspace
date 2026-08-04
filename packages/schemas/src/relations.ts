import { z } from 'zod';

/** Cookie name for spoiler-gate consent (~30 days). */
export const SPOILERS_OK_COOKIE_NAME = 'spoilers_ok';

/** Accepted cookie value for spoilers consent. */
export const SPOILERS_OK_COOKIE_VALUE = '1' as const;

/** Max-Age for spoilers_ok cookie (≈30 days). */
export const SPOILERS_OK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const SpoilersOkCookieValueSchema = z.literal(SPOILERS_OK_COOKIE_VALUE);

export type SpoilersOkCookieValue = z.infer<typeof SpoilersOkCookieValueSchema>;

/** Client consent payload written into the spoiler cookie. */
export const SpoilersConsentInputSchema = z.object({
  value: SpoilersOkCookieValueSchema,
});

export type SpoilersConsentInput = z.infer<typeof SpoilersConsentInputSchema>;

/** CharacterRelation.type (runtime on character page). */
export const CharacterRelationTypeSchema = z.enum([
  'FRIEND',
  'ENEMY',
  'FAMILY',
  'RELATED',
]);

export type CharacterRelationType = z.infer<typeof CharacterRelationTypeSchema>;

/**
 * WorkRelation.type — Prisma WorkRelation + GET /catalog/works/:slug relations.
 */
export const WorkRelationTypeSchema = z.enum([
  'SEQUEL',
  'PREQUEL',
  'RELATED',
  'ADAPTATION',
]);

export type WorkRelationType = z.infer<typeof WorkRelationTypeSchema>;

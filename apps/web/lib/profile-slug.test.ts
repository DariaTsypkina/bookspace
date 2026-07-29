import { describe, expect, it } from 'vitest';
import { parseProfileSlug, tryParseProfileSlug } from './profile-slug';

describe('parseProfileSlug (bd-0t0.8)', () => {
  it('trims and returns valid slug via shared ProfileSlugParamSchema', () => {
    expect(parseProfileSlug('  demo-reader  ')).toBe('demo-reader');
    expect(tryParseProfileSlug('demo-reader')).toBe('demo-reader');
  });

  it('rejects empty or oversized slug', () => {
    expect(tryParseProfileSlug('')).toBeNull();
    expect(tryParseProfileSlug('   ')).toBeNull();
    expect(tryParseProfileSlug('a'.repeat(201))).toBeNull();
    expect(() => parseProfileSlug('')).toThrow();
  });
});

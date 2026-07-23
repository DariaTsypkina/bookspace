import { describe, expect, it } from 'vitest';
import { designTokens, REQUIRED_TOKEN_KEYS } from './design-tokens';

describe('designTokens (читальня)', () => {
  it('exposes required Bookspace color tokens', () => {
    expect(REQUIRED_TOKEN_KEYS).toEqual([
      'background',
      'foreground',
      'muted',
      'border',
      'surface',
      'accent',
    ]);

    for (const key of REQUIRED_TOKEN_KEYS) {
      expect(designTokens[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('keeps reading-room palette values', () => {
    expect(designTokens.background).toBe('#f7f5f0');
    expect(designTokens.foreground).toBe('#1c1917');
    expect(designTokens.muted).toBe('#57534e');
    expect(designTokens.border).toBe('#d6d3d1');
    expect(designTokens.surface).toBe('#ffffff');
    expect(designTokens.accent).toBe('#292524');
  });

  it('maps each token to a CSS custom property name', () => {
    for (const key of REQUIRED_TOKEN_KEYS) {
      expect(designTokens.cssVar(key)).toBe(`--${key}`);
    }
  });
});

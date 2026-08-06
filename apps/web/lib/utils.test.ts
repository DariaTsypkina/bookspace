import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn (shadcn helper)', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves conflicting Tailwind classes via tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-foreground', 'text-muted')).toBe('text-muted');
  });

  it('supports conditional clsx inputs', () => {
    expect(cn('base', false && 'hidden', { 'bg-accent': true })).toBe(
      'base bg-accent',
    );
  });
});

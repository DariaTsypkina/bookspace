import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { getFriendlyZodIssueMessage } from './form-errors';

describe('getFriendlyZodIssueMessage', () => {
  it('returns localized message for invalid email', () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const result = schema.safeParse({
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected schema to fail for invalid email');
    }

    expect(getFriendlyZodIssueMessage(result.error.issues[0])).toBe(
      'Введите корректный email',
    );
  });

  it('returns localized fallback for too short text', () => {
    const schema = z.object({
      query: z.string().min(3),
    });

    const result = schema.safeParse({
      query: 'ab',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected schema to fail for too short input');
    }

    expect(getFriendlyZodIssueMessage(result.error.issues[0])).toBe(
      'Минимум 3 символа',
    );
  });
});

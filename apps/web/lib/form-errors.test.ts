import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AddLibraryItemInputSchema } from '@bookspace/schemas';
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
      'Минимум 3 символов',
    );
  });

  it('keeps workSlug empty validation in Russian for library form', () => {
    const result = AddLibraryItemInputSchema.safeParse({
      workSlug: '',
      status: 'WANT',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error('Expected schema to fail for empty workSlug');
    }

    const workSlugIssue = result.error.issues.find(
      (issue) => issue.path[0] === 'workSlug',
    );
    expect(workSlugIssue?.message).toBe('Укажите слаг произведения');
  });
});

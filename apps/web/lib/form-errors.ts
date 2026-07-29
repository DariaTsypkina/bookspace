import type { z } from 'zod';

type ZodIssueLike = z.ZodIssue;

/**
 * Maps raw Zod issues to user-friendly RU validation messages for UI forms.
 */
export function getFriendlyZodIssueMessage(issue: ZodIssueLike): string {
  switch (issue.code) {
    case 'invalid_type':
      return 'Заполните поле корректно';
    case 'invalid_format':
      if (issue.format === 'email') {
        return 'Введите корректный email';
      }
      return 'Некорректный формат значения';
    case 'too_small':
      if (typeof issue.minimum === 'number' && issue.origin === 'string') {
        return `Минимум ${issue.minimum} символа`;
      }
      return 'Значение слишком маленькое';
    case 'too_big':
      if (typeof issue.maximum === 'number' && issue.origin === 'string') {
        return `Максимум ${issue.maximum} символов`;
      }
      return 'Значение слишком большое';
    default:
      return issue.message || 'Проверьте корректность введённых данных';
  }
}

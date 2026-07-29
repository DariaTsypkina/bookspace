import { LoginInputSchema, RegisterInputSchema } from '@bookspace/schemas';
import { LoginDto, RegisterDto } from './auth.dto';

describe('Auth DTO shared schemas', () => {
  it('RegisterDto rejects payloads invalid for RegisterInputSchema', () => {
    const result = RegisterDto.schema.safeParse({
      email: 'bad-email',
      password: 'short',
    });

    expect(result.success).toBe(false);
    expect(
      RegisterInputSchema.safeParse({ email: 'bad-email', password: 'short' })
        .success,
    ).toBe(false);
  });

  it('LoginDto rejects payloads invalid for LoginInputSchema', () => {
    const result = LoginDto.schema.safeParse({
      email: 'bad-email',
      password: 'short',
    });

    expect(result.success).toBe(false);
    expect(
      LoginInputSchema.safeParse({ email: 'bad-email', password: 'short' })
        .success,
    ).toBe(false);
  });

  it('normalizes email before validation succeeds', () => {
    const result = RegisterDto.schema.safeParse({
      email: '  User@Example.COM  ',
      password: 'Secure123!',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });
});

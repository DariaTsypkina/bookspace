import { LoginInputSchema, RegisterInputSchema } from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const NormalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());

const RegisterDtoSchema = RegisterInputSchema.extend({
  email: NormalizedEmailSchema,
});

const LoginDtoSchema = LoginInputSchema.extend({
  email: NormalizedEmailSchema,
});

export class RegisterDto extends createZodDto(RegisterDtoSchema) {}

export class LoginDto extends createZodDto(LoginDtoSchema) {}

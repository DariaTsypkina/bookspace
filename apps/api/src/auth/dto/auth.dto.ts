import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const NormalizedEmailSchema = z.email().trim().toLowerCase();

const RegisterDtoSchema = z.object({
  email: NormalizedEmailSchema,
  password: z.string().min(8).max(128),
});

const LoginDtoSchema = z.object({
  email: NormalizedEmailSchema,
  password: z.string().min(8).max(128),
});

export class RegisterDto extends createZodDto(RegisterDtoSchema) {}

export class LoginDto extends createZodDto(LoginDtoSchema) {}

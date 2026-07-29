import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Invalid email',
  });
const RegisterPasswordSchema = z.string().min(8).max(128);
const LoginPasswordSchema = z.string();

const NormalizedRegisterSchema = z.object({
  email: EmailSchema,
  password: RegisterPasswordSchema,
});

const NormalizedLoginSchema = z.object({
  email: EmailSchema,
  password: LoginPasswordSchema,
});

function toNormalizedEmail({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class RegisterDto extends createZodDto(NormalizedRegisterSchema) {
  @Transform(toNormalizedEmail)
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto extends createZodDto(NormalizedLoginSchema) {
  @Transform(toNormalizedEmail)
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

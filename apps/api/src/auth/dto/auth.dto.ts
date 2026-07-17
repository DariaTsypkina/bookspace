import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

function toNormalizedEmail({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class RegisterDto {
  @Transform(toNormalizedEmail)
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto {
  @Transform(toNormalizedEmail)
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

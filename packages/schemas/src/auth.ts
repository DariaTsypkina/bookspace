import { z } from 'zod';

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

import {
  AdminContextExtractInputSchema,
  AdminContextListRecentQuerySchema,
  AdminContextPatchInputSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminContextListRecentQueryDto extends createZodDto(
  AdminContextListRecentQuerySchema,
) {}

export class AdminContextPatchDto extends createZodDto(
  AdminContextPatchInputSchema,
) {}

export class AdminContextExtractDto extends createZodDto(
  AdminContextExtractInputSchema,
) {}

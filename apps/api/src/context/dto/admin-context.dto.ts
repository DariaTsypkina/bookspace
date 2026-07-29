import {
  AdminContextExtractInputSchema,
  AdminContextListRecentQuerySchema,
  AdminContextPatchInputSchema,
  AdminContextReadingIdParamSchema,
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

export class AdminContextReadingIdParamDto extends createZodDto(
  AdminContextReadingIdParamSchema,
) {}

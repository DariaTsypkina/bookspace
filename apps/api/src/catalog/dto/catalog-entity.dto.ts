import {
  AdminWorkNeedsContextPatchInputSchema,
  CatalogEntitySlugParamSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CatalogEntitySlugParamDto extends createZodDto(
  CatalogEntitySlugParamSchema,
) {}

export class AdminWorkNeedsContextPatchDto extends createZodDto(
  AdminWorkNeedsContextPatchInputSchema,
) {}

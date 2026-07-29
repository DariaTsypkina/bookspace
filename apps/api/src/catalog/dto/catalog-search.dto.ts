import { CatalogSearchQuerySchema } from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CatalogSearchQueryDto extends createZodDto(
  CatalogSearchQuerySchema,
) {}

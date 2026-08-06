import {
  AdminCreateAuthorInputSchema,
  AdminCreateEditionInputSchema,
  AdminCreateExternalIdInputSchema,
  AdminCreateWorkInputSchema,
  AdminExternalIdParamSchema,
  AdminLinkWorkAuthorInputSchema,
  AdminListWorksQuerySchema,
  AdminUpdateWorkInputSchema,
  AdminWorkIdParamSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminCreateWorkDto extends createZodDto(
  AdminCreateWorkInputSchema,
) {}

export class AdminUpdateWorkDto extends createZodDto(
  AdminUpdateWorkInputSchema,
) {}

export class AdminListWorksQueryDto extends createZodDto(
  AdminListWorksQuerySchema,
) {}

export class AdminCreateExternalIdDto extends createZodDto(
  AdminCreateExternalIdInputSchema,
) {}

export class AdminExternalIdParamDto extends createZodDto(
  AdminExternalIdParamSchema,
) {}

export class AdminCreateAuthorDto extends createZodDto(
  AdminCreateAuthorInputSchema,
) {}

export class AdminLinkWorkAuthorDto extends createZodDto(
  AdminLinkWorkAuthorInputSchema,
) {}

export class AdminCreateEditionDto extends createZodDto(
  AdminCreateEditionInputSchema,
) {}

export class AdminCatalogWorkIdParamDto extends createZodDto(
  AdminWorkIdParamSchema,
) {}

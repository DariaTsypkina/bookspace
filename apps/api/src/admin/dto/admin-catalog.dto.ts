import {
  AdminCatalogImportJobIdParamSchema,
  AdminCatalogImportStartSchema,
  AdminCharacterIdParamSchema,
  AdminCreateAuthorInputSchema,
  AdminCreateCharacterInputSchema,
  AdminCreateEditionInputSchema,
  AdminCreateExternalIdInputSchema,
  AdminCreatePlaceInputSchema,
  AdminCreateSeriesInputSchema,
  AdminCreateWorldInputSchema,
  AdminCreateWorkInputSchema,
  AdminExternalIdParamSchema,
  AdminLinkWorkAuthorInputSchema,
  AdminListCharactersQuerySchema,
  AdminListPlacesQuerySchema,
  AdminListSeriesQuerySchema,
  AdminListWorldsQuerySchema,
  AdminListWorksQuerySchema,
  AdminMergeWorksInputSchema,
  AdminPlaceIdParamSchema,
  AdminSeriesIdParamSchema,
  AdminUpdateCharacterInputSchema,
  AdminUpdatePlaceInputSchema,
  AdminUpdateSeriesInputSchema,
  AdminUpdateWorldInputSchema,
  AdminUpdateWorkInputSchema,
  AdminWorkIdParamSchema,
  AdminWorldIdParamSchema,
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

export class AdminMergeWorksDto extends createZodDto(
  AdminMergeWorksInputSchema,
) {}

export class AdminCatalogImportStartDto extends createZodDto(
  AdminCatalogImportStartSchema,
) {}

export class AdminCatalogImportJobIdParamDto extends createZodDto(
  AdminCatalogImportJobIdParamSchema,
) {}

export class AdminCreateSeriesDto extends createZodDto(
  AdminCreateSeriesInputSchema,
) {}

export class AdminUpdateSeriesDto extends createZodDto(
  AdminUpdateSeriesInputSchema,
) {}

export class AdminListSeriesQueryDto extends createZodDto(
  AdminListSeriesQuerySchema,
) {}

export class AdminSeriesIdParamDto extends createZodDto(
  AdminSeriesIdParamSchema,
) {}

export class AdminCreateCharacterDto extends createZodDto(
  AdminCreateCharacterInputSchema,
) {}

export class AdminUpdateCharacterDto extends createZodDto(
  AdminUpdateCharacterInputSchema,
) {}

export class AdminListCharactersQueryDto extends createZodDto(
  AdminListCharactersQuerySchema,
) {}

export class AdminCharacterIdParamDto extends createZodDto(
  AdminCharacterIdParamSchema,
) {}

export class AdminCreateWorldDto extends createZodDto(
  AdminCreateWorldInputSchema,
) {}

export class AdminUpdateWorldDto extends createZodDto(
  AdminUpdateWorldInputSchema,
) {}

export class AdminListWorldsQueryDto extends createZodDto(
  AdminListWorldsQuerySchema,
) {}

export class AdminWorldIdParamDto extends createZodDto(
  AdminWorldIdParamSchema,
) {}

export class AdminCreatePlaceDto extends createZodDto(
  AdminCreatePlaceInputSchema,
) {}

export class AdminUpdatePlaceDto extends createZodDto(
  AdminUpdatePlaceInputSchema,
) {}

export class AdminListPlacesQueryDto extends createZodDto(
  AdminListPlacesQuerySchema,
) {}

export class AdminPlaceIdParamDto extends createZodDto(
  AdminPlaceIdParamSchema,
) {}

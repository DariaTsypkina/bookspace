import {
  MeLibraryListQuerySchema,
  PatchUserBookInputSchema,
  ProfileSlugParamSchema,
  PutUserBookBySlugInputSchema,
  UpsertUserBookInputSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpsertUserBookDto extends createZodDto(
  UpsertUserBookInputSchema,
) {}

export class PutUserBookBySlugDto extends createZodDto(
  PutUserBookBySlugInputSchema,
) {}

export class PatchUserBookDto extends createZodDto(PatchUserBookInputSchema) {}

export class MeLibraryListQueryDto extends createZodDto(
  MeLibraryListQuerySchema,
) {}

/** @deprecated alias — same as UpsertUserBookDto */
export class AddLibraryItemDto extends createZodDto(
  UpsertUserBookInputSchema,
) {}

export class ProfileSlugParamDto extends createZodDto(ProfileSlugParamSchema) {}

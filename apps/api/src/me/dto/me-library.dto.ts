import {
  PatchUserBookInputSchema,
  ProfileSlugParamSchema,
  UpsertUserBookInputSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpsertUserBookDto extends createZodDto(
  UpsertUserBookInputSchema,
) {}

export class PatchUserBookDto extends createZodDto(PatchUserBookInputSchema) {}

/** @deprecated alias — same as UpsertUserBookDto */
export class AddLibraryItemDto extends createZodDto(
  UpsertUserBookInputSchema,
) {}

export class ProfileSlugParamDto extends createZodDto(ProfileSlugParamSchema) {}

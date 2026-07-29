import {
  AddLibraryItemInputSchema,
  ProfileSlugParamSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class AddLibraryItemDto extends createZodDto(
  AddLibraryItemInputSchema,
) {}

export class ProfileSlugParamDto extends createZodDto(ProfileSlugParamSchema) {}

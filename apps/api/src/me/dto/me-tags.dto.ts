import {
  AssignTagInputSchema,
  CreateTagInputSchema,
  UpdateTagInputSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateTagDto extends createZodDto(CreateTagInputSchema) {}

export class UpdateTagDto extends createZodDto(UpdateTagInputSchema) {}

export class AssignTagDto extends createZodDto(AssignTagInputSchema) {}

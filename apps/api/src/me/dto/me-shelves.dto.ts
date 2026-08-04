import {
  AddShelfItemInputSchema,
  CreateShelfInputSchema,
  UpdateShelfInputSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateShelfDto extends createZodDto(CreateShelfInputSchema) {}

export class UpdateShelfDto extends createZodDto(UpdateShelfInputSchema) {}

export class AddShelfItemDto extends createZodDto(AddShelfItemInputSchema) {}

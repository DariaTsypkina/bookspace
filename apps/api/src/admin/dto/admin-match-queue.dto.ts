import {
  AdminMatchQueueIdParamSchema,
  AdminMatchQueueListQuerySchema,
  AdminMatchQueueResolveInputSchema,
} from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminMatchQueueListQueryDto extends createZodDto(
  AdminMatchQueueListQuerySchema,
) {}

export class AdminMatchQueueIdParamDto extends createZodDto(
  AdminMatchQueueIdParamSchema,
) {}

export class AdminMatchQueueResolveDto extends createZodDto(
  AdminMatchQueueResolveInputSchema,
) {}

import { AdminDashboardSummaryQuerySchema } from '@bookspace/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminDashboardSummaryQueryDto extends createZodDto(
  AdminDashboardSummaryQuerySchema,
) {}

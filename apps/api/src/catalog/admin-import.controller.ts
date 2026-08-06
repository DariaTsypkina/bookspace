import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { SessionUser } from '../auth/auth.service';
import {
  AdminCatalogImportJobIdParamDto,
  AdminCatalogImportStartDto,
} from '../admin/dto/admin-catalog.dto';
import { CatalogImportJobsService } from './catalog-import-jobs.service';

@Controller('admin/import/jobs')
@UseGuards(AuthGuard, RolesGuard)
export class AdminImportController {
  constructor(private readonly jobs: CatalogImportJobsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  start(
    @Body() body: AdminCatalogImportStartDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.jobs.startJob(body, user.id);
  }

  @Get(':jobId')
  @Roles(UserRole.ADMIN)
  status(@Param() params: AdminCatalogImportJobIdParamDto) {
    return this.jobs.getJob(params.jobId);
  }
}

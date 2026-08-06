import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { SessionUser } from '../auth/auth.service';
import { AdminWorkMergeService } from './admin-work-merge.service';
import {
  AdminCatalogWorkIdParamDto,
  AdminMergeWorksDto,
} from './dto/admin-catalog.dto';

@Controller('admin/works')
@UseGuards(AuthGuard, RolesGuard)
export class AdminWorkMergeController {
  constructor(private readonly mergeService: AdminWorkMergeService) {}

  @Post('merge')
  @Roles(UserRole.ADMIN)
  merge(@Body() body: AdminMergeWorksDto, @CurrentUser() user: SessionUser) {
    return this.mergeService.mergeWorks(
      body.canonicalId,
      body.duplicateIds,
      user.id,
    );
  }

  @Get(':workId/merge-candidates')
  @Roles(UserRole.ADMIN)
  candidates(@Param() params: AdminCatalogWorkIdParamDto) {
    return this.mergeService.findMergeCandidates(params.workId);
  }
}

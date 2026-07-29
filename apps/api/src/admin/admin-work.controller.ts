import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AdminWorkIdParamDto,
  AdminWorkNeedsContextPatchDto,
} from '../catalog/dto/catalog-entity.dto';
import { ContextClassifyService } from '../context/context-classify.service';
import { ContextExtractService } from '../context/context-extract.service';
import { ContextJobsService } from '../context/context-jobs.service';
import { AdminContextExtractDto } from '../context/dto/admin-context.dto';

@Controller('admin/works')
@UseGuards(AuthGuard, RolesGuard)
export class AdminWorkController {
  constructor(
    private readonly classifyService: ContextClassifyService,
    private readonly extractService: ContextExtractService,
    private readonly jobsService: ContextJobsService,
  ) {}

  @Patch(':workId/needs-context')
  @Roles(UserRole.ADMIN)
  patchNeedsContext(
    @Param() params: AdminWorkIdParamDto,
    @Body() body: AdminWorkNeedsContextPatchDto,
  ) {
    return this.classifyService.setAdminNeedsContext(
      params.workId,
      body.needsContext,
    );
  }

  @Post(':workId/context/classify')
  @Roles(UserRole.ADMIN)
  classifyContext(@Param() params: AdminWorkIdParamDto) {
    return this.classifyService.classifyWork(params.workId);
  }

  @Post(':workId/context/extract')
  @Roles(UserRole.ADMIN)
  async extractContext(
    @Param() params: AdminWorkIdParamDto,
    @Body() body: AdminContextExtractDto,
  ) {
    if (body.async) {
      const { jobId } = await this.jobsService.enqueueExtract(
        params.workId,
        body.force ?? false,
      );
      return { jobId, status: 'queued' };
    }
    return this.extractService.extractAndPublish(params.workId, {
      force: body.force ?? false,
    });
  }
}

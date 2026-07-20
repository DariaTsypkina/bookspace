import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NeedsContext, UserRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContextClassifyService } from '../context/context-classify.service';
import { ContextExtractService } from '../context/context-extract.service';
import { ContextJobsService } from '../context/context-jobs.service';

class PatchNeedsContextDto {
  @IsEnum(NeedsContext)
  needsContext!: NeedsContext;
}

class ExtractContextDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @IsOptional()
  @IsBoolean()
  async?: boolean;
}

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
    @Param('workId') workId: string,
    @Body() body: PatchNeedsContextDto,
  ) {
    return this.classifyService.setAdminNeedsContext(workId, body.needsContext);
  }

  @Post(':workId/context/classify')
  @Roles(UserRole.ADMIN)
  classifyContext(@Param('workId') workId: string) {
    return this.classifyService.classifyWork(workId);
  }

  @Post(':workId/context/extract')
  @Roles(UserRole.ADMIN)
  async extractContext(
    @Param('workId') workId: string,
    @Body() body: ExtractContextDto,
  ) {
    if (body.async) {
      const { jobId } = await this.jobsService.enqueueExtract(
        workId,
        body.force ?? false,
      );
      return { jobId, status: 'queued' };
    }
    return this.extractService.extractAndPublish(workId, {
      force: body.force ?? false,
    });
  }
}

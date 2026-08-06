import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminMatchQueueService } from './admin-match-queue.service';
import {
  AdminMatchQueueIdParamDto,
  AdminMatchQueueListQueryDto,
  AdminMatchQueueResolveDto,
} from './dto/admin-match-queue.dto';

@Controller('admin/match-queue')
@UseGuards(AuthGuard, RolesGuard)
export class AdminMatchQueueController {
  constructor(private readonly matchQueueService: AdminMatchQueueService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminMatchQueueListQueryDto) {
    return this.matchQueueService.list(query);
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN)
  resolve(
    @Param() params: AdminMatchQueueIdParamDto,
    @Body() body: AdminMatchQueueResolveDto,
  ) {
    return this.matchQueueService.resolve(params.id, body.workId);
  }

  @Post(':id/create-draft')
  @Roles(UserRole.ADMIN)
  createDraft(@Param() params: AdminMatchQueueIdParamDto) {
    return this.matchQueueService.createDraftAndResolve(params.id);
  }

  @Post(':id/dismiss')
  @Roles(UserRole.ADMIN)
  dismiss(@Param() params: AdminMatchQueueIdParamDto) {
    return this.matchQueueService.dismiss(params.id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { SessionUser } from '../auth/auth.service';
import { AdminContextService } from './admin-context.service';

class ListRecentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}

class PatchContextReadingDto {
  @IsOptional()
  @IsString()
  whyText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  importanceRank?: number;
}

@Controller('admin/context')
@UseGuards(AuthGuard, RolesGuard)
export class AdminContextController {
  constructor(private readonly adminContextService: AdminContextService) {}

  @Get('recent')
  @Roles(UserRole.ADMIN)
  listRecent(@Query() query: ListRecentQueryDto) {
    return this.adminContextService.listRecentAutoPublished({
      days: query.days,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  patchReading(
    @Param('id') id: string,
    @Body() body: PatchContextReadingDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.adminContextService.updateReading(id, user.id, body);
  }

  @Post(':id/unpublish')
  @Roles(UserRole.ADMIN)
  unpublish(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    return this.adminContextService.unpublishReading(id, user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  reject(@Param('id') id: string, @CurrentUser() user: SessionUser) {
    return this.adminContextService.rejectReading(id, user.id);
  }
}

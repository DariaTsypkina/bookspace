import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { SessionUser } from '../auth/auth.service';
import { AdminCatalogService } from './admin-catalog.service';
import {
  AdminCreateSeriesDto,
  AdminSeriesIdParamDto,
  AdminListSeriesQueryDto,
  AdminUpdateSeriesDto,
} from './dto/admin-catalog.dto';

@Controller('admin/series')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCatalogSeriesController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminListSeriesQueryDto) {
    return this.catalog.listSeries(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: AdminCreateSeriesDto) {
    return this.catalog.createSeries(body);
  }

  @Get(':seriesId')
  @Roles(UserRole.ADMIN)
  get(@Param() params: AdminSeriesIdParamDto) {
    return this.catalog.getSeries(params.seriesId);
  }

  @Patch(':seriesId')
  @Roles(UserRole.ADMIN)
  update(
    @Param() params: AdminSeriesIdParamDto,
    @Body() body: AdminUpdateSeriesDto,
  ) {
    return this.catalog.updateSeries(params.seriesId, body);
  }

  @Post(':seriesId/publish')
  @Roles(UserRole.ADMIN)
  publish(
    @Param() params: AdminSeriesIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.publishSeries(params.seriesId, user.id);
  }

  @Delete(':seriesId')
  @Roles(UserRole.ADMIN)
  softDelete(
    @Param() params: AdminSeriesIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.softDeleteSeries(params.seriesId, user.id);
  }
}

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
  AdminCreateWorldDto,
  AdminListWorldsQueryDto,
  AdminUpdateWorldDto,
  AdminWorldIdParamDto,
} from './dto/admin-catalog.dto';

@Controller('admin/worlds')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCatalogWorldsController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminListWorldsQueryDto) {
    return this.catalog.listWorlds(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: AdminCreateWorldDto) {
    return this.catalog.createWorld(body);
  }

  @Get(':worldId')
  @Roles(UserRole.ADMIN)
  get(@Param() params: AdminWorldIdParamDto) {
    return this.catalog.getWorld(params.worldId);
  }

  @Patch(':worldId')
  @Roles(UserRole.ADMIN)
  update(
    @Param() params: AdminWorldIdParamDto,
    @Body() body: AdminUpdateWorldDto,
  ) {
    return this.catalog.updateWorld(params.worldId, body);
  }

  @Post(':worldId/publish')
  @Roles(UserRole.ADMIN)
  publish(
    @Param() params: AdminWorldIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.publishWorld(params.worldId, user.id);
  }

  @Delete(':worldId')
  @Roles(UserRole.ADMIN)
  softDelete(
    @Param() params: AdminWorldIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.softDeleteWorld(params.worldId, user.id);
  }
}

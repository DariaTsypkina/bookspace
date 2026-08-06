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
  AdminCreatePlaceDto,
  AdminListPlacesQueryDto,
  AdminPlaceIdParamDto,
  AdminUpdatePlaceDto,
} from './dto/admin-catalog.dto';

@Controller('admin/places')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCatalogPlacesController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminListPlacesQueryDto) {
    return this.catalog.listPlaces(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: AdminCreatePlaceDto) {
    return this.catalog.createPlace(body);
  }

  @Get(':placeId')
  @Roles(UserRole.ADMIN)
  get(@Param() params: AdminPlaceIdParamDto) {
    return this.catalog.getPlace(params.placeId);
  }

  @Patch(':placeId')
  @Roles(UserRole.ADMIN)
  update(
    @Param() params: AdminPlaceIdParamDto,
    @Body() body: AdminUpdatePlaceDto,
  ) {
    return this.catalog.updatePlace(params.placeId, body);
  }

  @Post(':placeId/publish')
  @Roles(UserRole.ADMIN)
  publish(
    @Param() params: AdminPlaceIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.publishPlace(params.placeId, user.id);
  }

  @Delete(':placeId')
  @Roles(UserRole.ADMIN)
  softDelete(
    @Param() params: AdminPlaceIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.softDeletePlace(params.placeId, user.id);
  }
}

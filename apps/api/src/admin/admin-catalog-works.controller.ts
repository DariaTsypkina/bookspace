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
  AdminCatalogWorkIdParamDto,
  AdminCreateEditionDto,
  AdminCreateExternalIdDto,
  AdminCreateWorkDto,
  AdminExternalIdParamDto,
  AdminLinkWorkAuthorDto,
  AdminListWorksQueryDto,
  AdminUpdateWorkDto,
} from './dto/admin-catalog.dto';

@Controller('admin/works')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCatalogWorksController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminListWorksQueryDto) {
    return this.catalog.listWorks(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: AdminCreateWorkDto) {
    return this.catalog.createWork(body);
  }

  @Get(':workId')
  @Roles(UserRole.ADMIN)
  get(@Param() params: AdminCatalogWorkIdParamDto) {
    return this.catalog.getWork(params.workId);
  }

  @Patch(':workId')
  @Roles(UserRole.ADMIN)
  update(
    @Param() params: AdminCatalogWorkIdParamDto,
    @Body() body: AdminUpdateWorkDto,
  ) {
    return this.catalog.updateWork(params.workId, body);
  }

  @Post(':workId/publish')
  @Roles(UserRole.ADMIN)
  publish(
    @Param() params: AdminCatalogWorkIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.publishWork(params.workId, user.id);
  }

  @Delete(':workId')
  @Roles(UserRole.ADMIN)
  softDelete(
    @Param() params: AdminCatalogWorkIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.softDeleteWork(params.workId, user.id);
  }

  @Post(':workId/external-ids')
  @Roles(UserRole.ADMIN)
  addExternalId(
    @Param() params: AdminCatalogWorkIdParamDto,
    @Body() body: AdminCreateExternalIdDto,
  ) {
    return this.catalog.addWorkExternalId(params.workId, body);
  }

  @Delete(':workId/external-ids/:externalId')
  @Roles(UserRole.ADMIN)
  deleteExternalId(@Param() params: AdminExternalIdParamDto) {
    return this.catalog.deleteWorkExternalId(params.workId, params.externalId);
  }

  @Post(':workId/authors')
  @Roles(UserRole.ADMIN)
  linkAuthor(
    @Param() params: AdminCatalogWorkIdParamDto,
    @Body() body: AdminLinkWorkAuthorDto,
  ) {
    return this.catalog.linkWorkAuthor(params.workId, body);
  }

  @Get(':workId/editions')
  @Roles(UserRole.ADMIN)
  listEditions(@Param() params: AdminCatalogWorkIdParamDto) {
    return this.catalog.listEditions(params.workId);
  }

  @Post(':workId/editions')
  @Roles(UserRole.ADMIN)
  createEdition(
    @Param() params: AdminCatalogWorkIdParamDto,
    @Body() body: AdminCreateEditionDto,
  ) {
    return this.catalog.createEdition(params.workId, body);
  }
}

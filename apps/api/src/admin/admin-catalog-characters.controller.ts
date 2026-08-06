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
  AdminCharacterIdParamDto,
  AdminCreateCharacterDto,
  AdminListCharactersQueryDto,
  AdminUpdateCharacterDto,
} from './dto/admin-catalog.dto';

@Controller('admin/characters')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCatalogCharactersController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminListCharactersQueryDto) {
    return this.catalog.listCharacters(query);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: AdminCreateCharacterDto) {
    return this.catalog.createCharacter(body);
  }

  @Get(':characterId')
  @Roles(UserRole.ADMIN)
  get(@Param() params: AdminCharacterIdParamDto) {
    return this.catalog.getCharacter(params.characterId);
  }

  @Patch(':characterId')
  @Roles(UserRole.ADMIN)
  update(
    @Param() params: AdminCharacterIdParamDto,
    @Body() body: AdminUpdateCharacterDto,
  ) {
    return this.catalog.updateCharacter(params.characterId, body);
  }

  @Post(':characterId/publish')
  @Roles(UserRole.ADMIN)
  publish(
    @Param() params: AdminCharacterIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.publishCharacter(params.characterId, user.id);
  }

  @Delete(':characterId')
  @Roles(UserRole.ADMIN)
  softDelete(
    @Param() params: AdminCharacterIdParamDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.catalog.softDeleteCharacter(params.characterId, user.id);
  }
}

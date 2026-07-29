import { Controller, Get, Param } from '@nestjs/common';
import { CatalogCharacterService } from './catalog-character.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/characters')
export class CatalogCharacterController {
  constructor(
    private readonly catalogCharacterService: CatalogCharacterService,
  ) {}

  @Get(':slug')
  getBySlug(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogCharacterService.getBySlug(params.slug);
  }
}

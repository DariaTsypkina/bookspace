import { Controller, Get, Param } from '@nestjs/common';
import { CatalogCharacterService } from './catalog-character.service';

@Controller('catalog/characters')
export class CatalogCharacterController {
  constructor(
    private readonly catalogCharacterService: CatalogCharacterService,
  ) {}

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.catalogCharacterService.getBySlug(slug);
  }
}

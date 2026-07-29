import { Controller, Get, Param } from '@nestjs/common';
import { CatalogWorldService } from './catalog-world.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/worlds')
export class CatalogWorldController {
  constructor(private readonly catalogWorldService: CatalogWorldService) {}

  @Get(':slug')
  getBySlug(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogWorldService.getBySlug(params.slug);
  }
}

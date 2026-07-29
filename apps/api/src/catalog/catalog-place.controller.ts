import { Controller, Get, Param } from '@nestjs/common';
import { CatalogPlaceService } from './catalog-place.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/places')
export class CatalogPlaceController {
  constructor(private readonly catalogPlaceService: CatalogPlaceService) {}

  @Get(':slug')
  getBySlug(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogPlaceService.getBySlug(params.slug);
  }
}

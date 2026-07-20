import { Controller, Get, Param } from '@nestjs/common';
import { CatalogPlaceService } from './catalog-place.service';

@Controller('catalog/places')
export class CatalogPlaceController {
  constructor(private readonly catalogPlaceService: CatalogPlaceService) {}

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.catalogPlaceService.getBySlug(slug);
  }
}

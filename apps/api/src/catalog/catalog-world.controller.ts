import { Controller, Get, Param } from '@nestjs/common';
import { CatalogWorldService } from './catalog-world.service';

@Controller('catalog/worlds')
export class CatalogWorldController {
  constructor(private readonly catalogWorldService: CatalogWorldService) {}

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.catalogWorldService.getBySlug(slug);
  }
}

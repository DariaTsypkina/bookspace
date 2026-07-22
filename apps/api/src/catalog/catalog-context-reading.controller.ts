import { Controller, Get, Param } from '@nestjs/common';
import { CatalogContextReadingService } from './catalog-context-reading.service';

@Controller('catalog/works')
export class CatalogContextReadingController {
  constructor(
    private readonly catalogContextReadingService: CatalogContextReadingService,
  ) {}

  @Get(':slug/context-readings')
  listForWork(@Param('slug') slug: string) {
    return this.catalogContextReadingService.listPublishedForWorkSlug(slug);
  }
}

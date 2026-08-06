import { Controller, Get, Param } from '@nestjs/common';
import { CatalogContextReadingService } from './catalog-context-reading.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/works')
export class CatalogContextReadingController {
  constructor(
    private readonly catalogContextReadingService: CatalogContextReadingService,
  ) {}

  @Get(':slug/context-readings')
  listForWork(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogContextReadingService.listPublishedForWorkSlug(
      params.slug,
    );
  }
}

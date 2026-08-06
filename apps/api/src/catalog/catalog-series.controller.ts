import { Controller, Get, Param } from '@nestjs/common';
import { CatalogSeriesService } from './catalog-series.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/series')
export class CatalogSeriesController {
  constructor(private readonly catalogSeriesService: CatalogSeriesService) {}

  @Get(':slug')
  getBySlug(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogSeriesService.getBySlug(params.slug);
  }
}

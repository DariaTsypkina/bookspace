import { Controller, Get, Query } from '@nestjs/common';
import { CatalogSearchService } from './catalog-search.service';

@Controller('catalog/search')
export class CatalogSearchController {
  constructor(private readonly catalogSearchService: CatalogSearchService) {}

  @Get()
  search(@Query('q') q?: string) {
    return this.catalogSearchService.search(q ?? '');
  }
}

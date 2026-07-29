import { Controller, Get, Query } from '@nestjs/common';
import { CatalogSearchQueryDto } from './dto/catalog-search.dto';
import { CatalogSearchService } from './catalog-search.service';

@Controller('catalog/search')
export class CatalogSearchController {
  constructor(private readonly catalogSearchService: CatalogSearchService) {}

  @Get()
  search(@Query() query: CatalogSearchQueryDto) {
    return this.catalogSearchService.search(query.q, query.limit);
  }
}

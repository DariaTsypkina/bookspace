import { Controller, Get, Param } from '@nestjs/common';
import { CatalogWorkService } from './catalog-work.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/works')
export class CatalogWorkController {
  constructor(private readonly catalogWorkService: CatalogWorkService) {}

  @Get(':slug')
  getBySlug(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogWorkService.getBySlug(params.slug);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { CatalogAuthorService } from './catalog-author.service';
import { CatalogEntitySlugParamDto } from './dto/catalog-entity.dto';

@Controller('catalog/authors')
export class CatalogAuthorController {
  constructor(private readonly catalogAuthorService: CatalogAuthorService) {}

  @Get(':slug')
  getBySlug(@Param() params: CatalogEntitySlugParamDto) {
    return this.catalogAuthorService.getBySlug(params.slug);
  }
}

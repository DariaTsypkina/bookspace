import { Controller, Get, Param } from '@nestjs/common';
import { CatalogAuthorService } from './catalog-author.service';

@Controller('catalog/authors')
export class CatalogAuthorController {
  constructor(private readonly catalogAuthorService: CatalogAuthorService) {}

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.catalogAuthorService.getBySlug(slug);
  }
}

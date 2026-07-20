import { Controller, Get, Param } from '@nestjs/common';
import { CatalogWorkService } from './catalog-work.service';

@Controller('catalog/works')
export class CatalogWorkController {
  constructor(private readonly catalogWorkService: CatalogWorkService) {}

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.catalogWorkService.getBySlug(slug);
  }
}

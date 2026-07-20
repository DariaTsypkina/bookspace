import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogSearchController } from './catalog-search.controller';
import { CatalogSearchService } from './catalog-search.service';
import { CatalogWorkController } from './catalog-work.controller';
import { CatalogWorkService } from './catalog-work.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogSearchController, CatalogWorkController],
  providers: [CatalogSearchService, CatalogWorkService],
  exports: [CatalogSearchService, CatalogWorkService],
})
export class CatalogModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogSearchController } from './catalog-search.controller';
import { CatalogSearchService } from './catalog-search.service';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogSearchController],
  providers: [CatalogSearchService],
  exports: [CatalogSearchService],
})
export class CatalogModule {}

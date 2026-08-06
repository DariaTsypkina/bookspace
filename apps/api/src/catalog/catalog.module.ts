import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogAuthorController } from './catalog-author.controller';
import { CatalogAuthorService } from './catalog-author.service';
import { CatalogCharacterController } from './catalog-character.controller';
import { CatalogCharacterService } from './catalog-character.service';
import { CatalogPlaceController } from './catalog-place.controller';
import { CatalogPlaceService } from './catalog-place.service';
import { CatalogSeriesController } from './catalog-series.controller';
import { CatalogSeriesService } from './catalog-series.service';
import { CatalogWorldController } from './catalog-world.controller';
import { CatalogWorldService } from './catalog-world.service';
import { CatalogSearchController } from './catalog-search.controller';
import { CatalogSearchService } from './catalog-search.service';
import { CatalogContextReadingController } from './catalog-context-reading.controller';
import { CatalogContextReadingService } from './catalog-context-reading.service';
import { CatalogWorkController } from './catalog-work.controller';
import { CatalogWorkService } from './catalog-work.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CatalogSearchController,
    CatalogContextReadingController,
    CatalogWorkController,
    CatalogAuthorController,
    CatalogSeriesController,
    CatalogCharacterController,
    CatalogWorldController,
    CatalogPlaceController,
  ],
  providers: [
    CatalogSearchService,
    CatalogContextReadingService,
    CatalogWorkService,
    CatalogAuthorService,
    CatalogSeriesService,
    CatalogCharacterService,
    CatalogWorldService,
    CatalogPlaceService,
  ],
  exports: [
    CatalogSearchService,
    CatalogContextReadingService,
    CatalogWorkService,
    CatalogAuthorService,
    CatalogSeriesService,
    CatalogCharacterService,
    CatalogWorldService,
    CatalogPlaceService,
  ],
})
export class CatalogModule {}

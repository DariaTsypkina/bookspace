import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CatalogAuthorController } from './catalog-author.controller';
import { CatalogAuthorService } from './catalog-author.service';
import { CatalogCharacterController } from './catalog-character.controller';
import { CatalogCharacterService } from './catalog-character.service';
import { CatalogWorldController } from './catalog-world.controller';
import { CatalogWorldService } from './catalog-world.service';
import { CatalogSearchController } from './catalog-search.controller';
import { CatalogSearchService } from './catalog-search.service';
import { CatalogWorkController } from './catalog-work.controller';
import { CatalogWorkService } from './catalog-work.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CatalogSearchController,
    CatalogWorkController,
    CatalogAuthorController,
    CatalogCharacterController,
    CatalogWorldController,
  ],
  providers: [
    CatalogSearchService,
    CatalogWorkService,
    CatalogAuthorService,
    CatalogCharacterService,
    CatalogWorldService,
  ],
  exports: [
    CatalogSearchService,
    CatalogWorkService,
    CatalogAuthorService,
    CatalogCharacterService,
    CatalogWorldService,
  ],
})
export class CatalogModule {}

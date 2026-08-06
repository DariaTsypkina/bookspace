import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminCatalogAuthorsController } from './admin-catalog-authors.controller';
import { AdminCatalogCharactersController } from './admin-catalog-characters.controller';
import { AdminCatalogPlacesController } from './admin-catalog-places.controller';
import { AdminCatalogSeriesController } from './admin-catalog-series.controller';
import { AdminCatalogWorksController } from './admin-catalog-works.controller';
import { AdminCatalogWorldsController } from './admin-catalog-worlds.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminWorkMergeController } from './admin-work-merge.controller';
import { AdminWorkMergeService } from './admin-work-merge.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminWorkMergeController,
    AdminCatalogWorksController,
    AdminCatalogAuthorsController,
    AdminCatalogSeriesController,
    AdminCatalogCharactersController,
    AdminCatalogWorldsController,
    AdminCatalogPlacesController,
  ],
  providers: [AdminCatalogService, AdminWorkMergeService, AuditService],
  exports: [AdminCatalogService, AdminWorkMergeService],
})
export class AdminCatalogModule {}

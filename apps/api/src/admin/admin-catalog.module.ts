import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminCatalogAuthorsController } from './admin-catalog-authors.controller';
import { AdminCatalogWorksController } from './admin-catalog-works.controller';
import { AdminCatalogService } from './admin-catalog.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminCatalogWorksController, AdminCatalogAuthorsController],
  providers: [AdminCatalogService, AuditService],
  exports: [AdminCatalogService],
})
export class AdminCatalogModule {}

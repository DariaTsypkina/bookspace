import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminImportController } from './admin-import.controller';
import { CATALOG_QUEUE } from './catalog.constants';
import { CatalogImportJobsService } from './catalog-import-jobs.service';
import { CatalogImportProcessor } from './catalog-import.processor';
import { CatalogImportService } from './catalog-import.service';

function redisConnection() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
  };
}

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue({
      name: CATALOG_QUEUE,
      connection: redisConnection(),
    }),
  ],
  controllers: [AdminImportController],
  providers: [
    AuditService,
    CatalogImportService,
    CatalogImportJobsService,
    CatalogImportProcessor,
  ],
  exports: [CatalogImportService, CatalogImportJobsService],
})
export class CatalogImportModule {}

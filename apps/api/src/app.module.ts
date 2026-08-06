import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminCatalogModule } from './admin/admin-catalog.module';
import { AdminDashboardModule } from './admin/admin-dashboard.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ContextModule } from './context/context.module';
import { HttpOutboundModule } from './http/http-outbound.module';
import { PrismaModule } from './prisma/prisma.module';

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
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({ connection: redisConnection() }),
    PrismaModule,
    HttpOutboundModule,
    AuthModule,
    CatalogModule,
    ContextModule,
    AdminDashboardModule,
    AdminCatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

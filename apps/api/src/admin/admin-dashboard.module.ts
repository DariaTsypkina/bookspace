import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CONTEXT_QUEUE } from '../context/context-jobs.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

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
      name: CONTEXT_QUEUE,
      connection: redisConnection(),
    }),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}

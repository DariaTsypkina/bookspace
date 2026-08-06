import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminMatchQueueController } from './admin-match-queue.controller';
import { AdminMatchQueueService } from './admin-match-queue.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminMatchQueueController],
  providers: [AdminMatchQueueService],
  exports: [AdminMatchQueueService],
})
export class AdminMatchQueueModule {}

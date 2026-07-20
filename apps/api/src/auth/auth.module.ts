import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from '../admin/admin.controller';
import { MeLibraryController } from '../me/me-library.controller';
import { AuthRateLimiterFactory } from './auth-rate-limiter.factory';
import { AuthRateLimiterService } from './auth-rate-limiter.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOAuthClient } from './google-oauth.client';
import { AuthGuard } from './guards/auth.guard';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { RolesGuard } from './guards/roles.guard';
import { YandexOAuthClient } from './yandex-oauth.client';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('SESSION_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController, AdminController, MeLibraryController],
  providers: [
    AuthService,
    AuthRateLimiterFactory,
    {
      provide: AuthRateLimiterService,
      inject: [AuthRateLimiterFactory],
      useFactory: (factory: AuthRateLimiterFactory) => factory.create(),
    },
    GoogleOAuthClient,
    YandexOAuthClient,
    AuthGuard,
    AuthRateLimitGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtModule, AuthGuard, RolesGuard],
})
export class AuthModule {}

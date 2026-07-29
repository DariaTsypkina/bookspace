import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

/** Default timeout for outbound HTTP (OAuth, external APIs), ms. */
export const OUTBOUND_HTTP_TIMEOUT_MS = 10_000;

/**
 * Shared Nest HttpModule for api outbound calls (HttpService).
 * Import where clients need HttpService; do not instantiate axios outside HttpModule.
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: OUTBOUND_HTTP_TIMEOUT_MS,
    }),
  ],
  exports: [HttpModule],
})
export class HttpOutboundModule {}

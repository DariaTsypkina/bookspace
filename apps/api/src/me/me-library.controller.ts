import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { SessionUser } from '../auth/auth.service';
import { AddLibraryItemDto } from './dto/me-library.dto';

/**
 * Minimal stub for session-gated library mutations (full UserBook later).
 */
@Controller('me/library')
@UseGuards(AuthGuard)
export class MeLibraryController {
  @Post('items')
  @HttpCode(201)
  addItem(@CurrentUser() user: SessionUser, @Body() body: AddLibraryItemDto) {
    return {
      ok: true,
      userId: user.id,
      workId: body.workId ?? null,
    };
  }
}

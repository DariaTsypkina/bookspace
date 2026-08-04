import { Controller, Get, Param } from '@nestjs/common';
import { MeLibraryService } from '../me/me-library.service';

/** Публичная коллекция пользователя (статусы/оценки). */
@Controller('users')
export class PublicLibraryController {
  constructor(private readonly library: MeLibraryService) {}

  @Get(':slug/library')
  listLibrary(@Param('slug') slug: string) {
    return this.library.listPublicBySlug(slug);
  }
}

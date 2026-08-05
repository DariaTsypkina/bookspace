import { Controller, Get, Param } from '@nestjs/common';
import { MeLibraryService } from '../me/me-library.service';

/** Публичная коллекция пользователя (статусы/оценки/заметки/цель). */
@Controller('users')
export class PublicLibraryController {
  constructor(private readonly library: MeLibraryService) {}

  @Get(':slug/library/works/:workSlug')
  getLibraryWork(
    @Param('slug') slug: string,
    @Param('workSlug') workSlug: string,
  ) {
    return this.library.getPublicBySlugAndWorkSlug(slug, workSlug);
  }

  @Get(':slug/library')
  listLibrary(@Param('slug') slug: string) {
    return this.library.listPublicBySlug(slug);
  }
}

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminCreateAuthorDto } from './dto/admin-catalog.dto';

const AdminListAuthorsQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
});

class AdminListAuthorsQueryDto extends createZodDto(
  AdminListAuthorsQuerySchema,
) {}

@Controller('admin/authors')
@UseGuards(AuthGuard, RolesGuard)
export class AdminCatalogAuthorsController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  list(@Query() query: AdminListAuthorsQueryDto) {
    return this.catalog.listAuthors(query.q);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: AdminCreateAuthorDto) {
    return this.catalog.createAuthor(body);
  }
}

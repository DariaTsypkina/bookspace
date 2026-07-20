import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('ping')
  @Roles(UserRole.ADMIN)
  ping() {
    return { ok: true };
  }
}

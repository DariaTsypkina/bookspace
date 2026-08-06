import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardSummaryQueryDto } from './dto/admin-dashboard.dto';

@Controller('admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN)
  getSummary(@Query() query: AdminDashboardSummaryQueryDto) {
    return this.dashboardService.getSummary({ days: query.days });
  }
}

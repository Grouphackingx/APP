import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('organizers')
  getAllOrganizers() {
    return this.adminService.getAllOrganizers();
  }

  @Patch('organizers/:id/status')
  setOrganizerStatus(
    @Param('id') userId: string,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) {
    return this.adminService.setOrganizerStatus(userId, status as any); // cast safely using enums generated
  }
}

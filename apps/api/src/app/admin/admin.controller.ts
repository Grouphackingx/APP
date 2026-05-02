import { Controller, Get, Patch, Delete, Post, Param, Body, UseGuards } from '@nestjs/common';
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

  @Post('organizers')
  createOrganizer(@Body() data: any) {
    return this.adminService.createOrganizer(data);
  }

  @Patch('organizers/:id/status')
  setOrganizerStatus(
    @Param('id') userId: string,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) {
    return this.adminService.setOrganizerStatus(userId, status as any); // cast safely using enums generated
  }

  @Patch('organizers/:id')
  updateOrganizer(
    @Param('id') userId: string,
    @Body() updateData: any
  ) {
    return this.adminService.updateOrganizer(userId, updateData);
  }

  @Delete('organizers/:id')
  deleteOrganizer(@Param('id') userId: string) {
    return this.adminService.deleteOrganizer(userId);
  }

  // --- PLANS ---

  @Get('plans')
  getAllPlans() {
    return this.adminService.getAllPlans();
  }

  @Post('plans')
  createPlan(@Body() data: any) {
    return this.adminService.createPlan(data);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePlan(id, data);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.adminService.deletePlan(id);
  }
}

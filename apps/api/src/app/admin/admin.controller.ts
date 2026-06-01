import { Controller, Get, Patch, Delete, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
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
  @Roles(Role.ADMIN, Role.EDITOR)
  getAllOrganizers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllOrganizers(
      page ? Math.max(1, parseInt(page, 10)) : 1,
      limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
    );
  }

  @Get('analytics/organizers')
  @Roles(Role.ADMIN, Role.EDITOR)
  getOrganizersAnalytics() {
    return this.adminService.getOrganizersAnalytics();
  }

  @Post('organizers')
  createOrganizer(@Body() data: any) {
    return this.adminService.createOrganizer(data);
  }

  @Patch('organizers/:id/status')
  @Roles(Role.ADMIN, Role.EDITOR)
  setOrganizerStatus(
    @Param('id') userId: string,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED',
    @Body('reason') reason?: string,
  ) {
    return this.adminService.setOrganizerStatus(userId, status as any, reason);
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

  @Post('organizers/:id/impersonate')
  impersonateOrganizer(@Param('id') targetUserId: string, @Request() req: any) {
    return this.adminService.impersonateOrganizer(targetUserId, req.user.userId);
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

  // --- ADMIN USERS ---

  @Get('users')
  getAdminUsers() {
    return this.adminService.getAdminUsers();
  }

  @Post('users')
  createAdminUser(@Body() data: any) {
    return this.adminService.createAdminUser(data);
  }

  @Patch('users/:id')
  updateAdminUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAdminUser(id, data);
  }

  @Delete('users/:id')
  deleteAdminUser(@Param('id') id: string) {
    return this.adminService.deleteAdminUser(id);
  }

  // --- EVENTS ---

  @Get('events')
  @Roles(Role.ADMIN, Role.EDITOR)
  getAllEvents(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllEvents(
      page ? Math.max(1, parseInt(page, 10)) : 1,
      limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
    );
  }

  // --- SYSTEM CONFIG ---

  @Get('config')
  getConfig() {
    return this.adminService.getConfig();
  }

  @Patch('config')
  updateConfig(@Body('paidEventsEnabled') paidEventsEnabled: boolean) {
    return this.adminService.updateConfig(paidEventsEnabled);
  }

  @Patch('organizers/:id/payment-gateway')
  setOrgPaymentGateway(
    @Param('id') userId: string,
    @Body('paidEventsEnabled') paidEventsEnabled: boolean | null,
  ) {
    return this.adminService.setOrgPaymentGateway(userId, paidEventsEnabled);
  }

  // --- ATTENDEES ---

  @Get('attendees')
  @Roles(Role.ADMIN, Role.EDITOR)
  getAttendees(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAttendees(
      page ? Math.max(1, parseInt(page, 10)) : 1,
      limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 20,
      search || '',
    );
  }

  @Get('attendees/export')
  @Roles(Role.ADMIN, Role.EDITOR)
  exportAttendees(@Query('search') search?: string) {
    return this.adminService.exportAttendees(search || '');
  }

  @Patch('attendees/:id')
  @Roles(Role.ADMIN, Role.EDITOR)
  updateAttendee(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAttendee(id, data);
  }

  @Delete('attendees/:id')
  deleteAttendee(@Param('id') id: string) {
    return this.adminService.deleteAttendee(id);
  }

  @Patch('attendees/:id/block')
  @Roles(Role.ADMIN, Role.EDITOR)
  blockAttendee(@Param('id') id: string, @Body('isBlocked') isBlocked: boolean) {
    return this.adminService.blockAttendee(id, isBlocked);
  }

  @Patch('attendees/:id/password')
  changeAttendeePassword(@Param('id') id: string, @Body('password') password: string) {
    return this.adminService.changeAttendeePassword(id, password);
  }

  @Patch('events/:id/featured')
  @Roles(Role.ADMIN)
  toggleEventFeatured(
    @Param('id') id: string,
    @Body('isFeatured') isFeatured: boolean,
    @Body('durationDays') durationDays?: number
  ) {
    return this.adminService.toggleEventFeatured(id, isFeatured, durationDays);
  }
}

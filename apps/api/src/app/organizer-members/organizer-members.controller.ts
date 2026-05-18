import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { OrganizerMembersService } from './organizer-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizer-members')
@UseGuards(JwtAuthGuard)
export class OrganizerMembersController {
    constructor(private readonly service: OrganizerMembersService) {}

    private requireMainOrganizer(req: any) {
        if (req.user.isMember) throw new ForbiddenException('Solo el organizador principal puede gestionar usuarios');
    }

    @Get()
    getMembers(@Request() req: any) {
        this.requireMainOrganizer(req);
        return this.service.getMembers(req.user.userId);
    }

    @Post()
    createMember(@Request() req: any, @Body() body: any) {
        this.requireMainOrganizer(req);
        return this.service.createMember(req.user.userId, body);
    }

    @Patch(':id')
    updateMember(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        this.requireMainOrganizer(req);
        return this.service.updateMember(req.user.userId, id, body);
    }

    @Delete(':id')
    deleteMember(@Request() req: any, @Param('id') id: string) {
        this.requireMainOrganizer(req);
        return this.service.deleteMember(req.user.userId, id);
    }
}

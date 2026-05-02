import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Patch, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from '@open-ticket/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req: any, @Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(req.user.userId, createEventDto);
    }

    @Get()
    findAll(@Query('q') query?: string) {
        return this.eventsService.findAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMyEvents(@Request() req: any) {
        return this.eventsService.findMyEvents(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Request() req: any) {
        // Read strictly from the unvalidated raw body to prevent class-validator from dropping valid zones
        const rawBody = req.body;
        return this.eventsService.update(id, rawBody);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}

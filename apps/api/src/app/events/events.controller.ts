import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from '@open-ticket/shared';
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
    findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }
}

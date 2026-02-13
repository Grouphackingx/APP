import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post('validate')
    validate(@Request() req: any, @Body('token') token: string) {
        // En un sistema real, verificaríamos si el usuario (req.user) tiene rol STAFF/ADMIN
        // req.user viene del JwtAuthGuard
        return this.ticketsService.validateTicket(token, req.user.userId);
    }
}

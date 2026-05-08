import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Post('validate')
    validate(@Request() req: { user: { userId: string } }, @Body('token') token: string) {
        return this.ticketsService.validateTicket(token, req.user.userId);
    }

    @Post('validate-by-id')
    validateById(@Request() req: { user: { userId: string } }, @Body('ticketId') ticketId: string) {
        return this.ticketsService.validateByTicketId(ticketId, req.user.userId);
    }
}

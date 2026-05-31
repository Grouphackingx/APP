import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { LockSeatsDto, CreateOrderDto } from '@open-ticket/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * POST /api/orders/lock-seats
     * Lock seats for the current user (10 min reservation).
     */
    @Post('lock-seats')
    lockSeats(@Request() req: any, @Body() dto: LockSeatsDto) {
        return this.ordersService.lockSeats(req.user.userId, dto.seatIds);
    }

    /**
     * POST /api/orders/unlock-seats
     * Release locked seats.
     */
    @Post('unlock-seats')
    unlockSeats(@Request() req: any, @Body() dto: LockSeatsDto) {
        return this.ordersService.unlockSeats(req.user.userId, dto.seatIds);
    }

    /**
     * POST /api/orders/purchase
     * Create an order, mark seats as sold, generate QR tickets.
     */
    @Post('purchase')
    purchase(@Request() req: any, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.userId, dto.eventId, dto.seatIds);
    }

    /**
     * GET /api/orders?page=1&limit=10
     * Get current user's orders (paginated).
     */
    @Get()
    getUserOrders(
        @Request() req: any,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ) {
        return this.ordersService.getUserOrders(req.user.userId, parseInt(page), parseInt(limit));
    }

    /**
     * GET /api/orders/attendees/me?page=1&limit=20
     * Get all attendees for events owned by the authenticated organizer (paginated).
     */
    @Get('attendees/me')
    getMyEventAttendees(
        @Request() req: { user: { userId: string } },
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.ordersService.getMyEventAttendees(req.user.userId, parseInt(page), parseInt(limit));
    }
}

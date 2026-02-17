import {
    Injectable,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PaymentsService } from '../payments/payments.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
        private jwtService: JwtService,
        private payments: PaymentsService,
    ) { }

    /**
     * Step 1: Lock seats for a user using Redis.
     * Prevents other users from selecting them for 10 minutes.
     */
    async lockSeats(userId: string, seatIds: string[]) {
        if (!seatIds.length) {
            throw new BadRequestException('No seats provided');
        }

        // Verify seats exist and are not sold
        const seats = await this.prisma.seat.findMany({
            where: { id: { in: seatIds } },
            include: { zone: true },
        });

        if (seats.length !== seatIds.length) {
            throw new NotFoundException('One or more seats not found');
        }

        const soldSeats = seats.filter(s => s.isSold);
        if (soldSeats.length > 0) {
            throw new ConflictException('One or more seats are already sold');
        }

        // Try to lock all seats atomically
        const lockResults: { seatId: string; locked: boolean }[] = [];
        for (const seatId of seatIds) {
            const locked = await this.redis.lockSeat(seatId, userId, 600); // 10 min TTL
            lockResults.push({ seatId, locked });
        }

        // If any lock failed, release all acquired locks
        const failedLocks = lockResults.filter(r => !r.locked);
        if (failedLocks.length > 0) {
            const successfulLocks = lockResults.filter(r => r.locked);
            await this.redis.unlockSeats(
                successfulLocks.map(r => r.seatId),
                userId,
            );
            throw new ConflictException(
                `Seats ${failedLocks.map(f => f.seatId).join(', ')} are being held by another user`,
            );
        }

        return {
            locked: true,
            seatIds,
            expiresInSeconds: 600,
            message: `${seatIds.length} seat(s) locked for 10 minutes`,
        };
    }

    /**
     * Step 2: Release locked seats.
     */
    async unlockSeats(userId: string, seatIds: string[]) {
        await this.redis.unlockSeats(seatIds, userId);
        return { unlocked: true, seatIds };
    }

    /**
     * Step 3: Create order and generate tickets with QR JWT tokens.
     * This is the "purchase" step.
     */
    async createOrder(userId: string, eventId: string, seatIds: string[]) {
        if (!seatIds.length) {
            throw new BadRequestException('No seats provided');
        }

        // Verify all seats belong to the event and are not sold
        const seats = await this.prisma.seat.findMany({
            where: { id: { in: seatIds } },
            include: { zone: { include: { event: true } } },
        });

        if (seats.length !== seatIds.length) {
            throw new NotFoundException('One or more seats not found');
        }

        // Verify seats belong to the correct event
        const wrongEvent = seats.filter(s => s.zone.eventId !== eventId);
        if (wrongEvent.length > 0) {
            throw new BadRequestException('Seats do not belong to the specified event');
        }

        // Double-check no seats are sold (defense in depth)
        const alreadySold = seats.filter(s => s.isSold);
        if (alreadySold.length > 0) {
            throw new ConflictException('One or more seats are already sold');
        }

        // Verify the user holds the Redis locks for these seats
        for (const seatId of seatIds) {
            const holder = await this.redis.getSeatLockHolder(seatId);
            if (holder !== userId) {
                throw new ConflictException(
                    `You do not hold the lock for seat ${seatId}. Please select seats again.`,
                );
            }
        }

        // Calculate total
        const totalAmount = seats.reduce((sum, seat) => sum + Number(seat.zone.price), 0);

        // Process Payment via Stripe (Simulated)
        const paymentSuccess = await this.payments.processPayment('tok_visa', totalAmount);
        if (!paymentSuccess) {
            throw new BadRequestException('Payment failed');
        }

        // Create order with tickets in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            // Generar Order ID y Ticket IDs de antemano para el payload del QR
            const orderId = uuidv4();
            
            const ticketsData = seats.map(seat => {
                const ticketId = uuidv4();
                const qrPayload = {
                    ticketId,
                    orderId,
                    seatId: seat.id,
                    eventId,
                    userId,
                    zoneName: seat.zone.name,
                    seatNumber: seat.number,
                    iat: Math.floor(Date.now() / 1000),
                };
                const qrCodeToken = this.jwtService.sign(qrPayload, { expiresIn: '365d' });
                
                return {
                    id: ticketId,
                    qrCodeToken,
                    status: 'VALID',
                };
            });

            // Mark seats as sold isSold=true
            // Note: Prisma updateMany doesn't support complex joins in where easily, 
            // but we have IDs.
            await tx.seat.updateMany({
                where: { id: { in: seatIds } },
                data: { isSold: true },
            });

            // Create order with nested tickets (using prepared IDs)
            // Note: Prisma create doesn't support setting ID on nested create easily if relation expects it?
            // Actually it does support explicit ID.
            
            // However, to be safe and clean, let's create Order then Tickets.
            const newOrder = await tx.order.create({
                data: {
                    id: orderId,
                    userId,
                    totalAmount,
                    status: 'COMPLETED',
                    paymentRef: 'pi_mock_123',
                },
            });

            // Create tickets linked to order
            // We use createMany for performance, but createMany doesn't support setting relation by ID in some versions?
            // createMany is fine if we provide orderId.
            // Ticket model schema: id, orderId, qrCodeToken, status...
            // Check schema: Ticket has orderId foreign key.
            await tx.ticket.createMany({
                data: ticketsData.map(t => ({
                    id: t.id,
                    orderId: newOrder.id,
                    qrCodeToken: t.qrCodeToken,
                    status: 'VALID' as any, // Cast enum if needed
                })),
            });

            return { ...newOrder, tickets: ticketsData };
        });

        // Release Redis locks
        await this.redis.unlockSeats(seatIds, userId);

        return {
            orderId: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            ticketCount: order.tickets.length,
            tickets: order.tickets,
        };
    }

    /**
     * Get orders for a user.
     */
    async getUserOrders(userId: string) {
        const orders = await this.prisma.order.findMany({
            where: { userId },
            include: {
                tickets: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Enrich tickets with decoded QR info (event name, zone, seat, etc.)
        const enrichedOrders = await Promise.all(
            orders.map(async (order) => {
                const enrichedTickets = await Promise.all(
                    order.tickets.map(async (ticket) => {
                        try {
                            const decoded = this.jwtService.verify(ticket.qrCodeToken);
                            // Fetch event title from DB
                            // Fetch event title from DB
                            let eventTitle = 'Evento';
                            let eventDate = '';
                            let eventLocation = '';
                            let hasSeatingChart = true; // Default to true for backward compatibility
                            if (decoded.eventId) {
                                const event = await this.prisma.event.findUnique({
                                    where: { id: decoded.eventId },
                                    select: { title: true, date: true, location: true, hasSeatingChart: true },
                                });
                                if (event) {
                                    eventTitle = event.title;
                                    eventDate = event.date.toISOString();
                                    eventLocation = event.location;
                                    hasSeatingChart = event.hasSeatingChart ?? true;
                                }
                            }
                            return {
                                ...ticket,
                                eventId: decoded.eventId || null,
                                eventTitle,
                                eventDate,
                                eventLocation,
                                hasSeatingChart,
                                zoneName: decoded.zoneName || 'General',
                                seatNumber: decoded.seatNumber || '-',
                            };
                        } catch {
                            return {
                                ...ticket,
                                eventId: null,
                                eventTitle: 'Evento',
                                eventDate: '',
                                eventLocation: '',
                                zoneName: 'General',
                                seatNumber: '-',
                            };
                        }
                    }),
                );
                return { ...order, tickets: enrichedTickets };
            }),
        );

        return enrichedOrders;
    }
}

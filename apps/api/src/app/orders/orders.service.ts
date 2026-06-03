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
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
        private jwtService: JwtService,
        private payments: PaymentsService,
        private mail: MailService,
    ) { }

    /**
     * Resuelve si la pasarela de pagos está habilitada para un organizador:
     * override por organizador si existe, si no la configuración global.
     */
    private async resolvePaymentEnabled(organizerId: string): Promise<boolean> {
        const profile = await this.prisma.organizerProfile.findUnique({
            where: { userId: organizerId },
            select: { paidEventsEnabled: true },
        });
        if (profile?.paidEventsEnabled !== null && profile?.paidEventsEnabled !== undefined) {
            return profile.paidEventsEnabled;
        }
        const config = await this.prisma.systemConfig.upsert({
            where: { id: 'global' },
            create: { id: 'global', paidEventsEnabled: false },
            update: {},
        });
        return config.paidEventsEnabled;
    }

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

        // Kill-switch de pagos: si la compra tiene costo (> $0), verificamos que la
        // pasarela esté habilitada para el organizador del evento (override por
        // organizador, o config global como fallback). Si está deshabilitada, se
        // bloquea la venta en tiempo real, aunque el evento ya tuviera precios.
        if (totalAmount > 0) {
            const organizerId = seats[0].zone.event.organizerId;
            const paidEnabled = await this.resolvePaymentEnabled(organizerId);
            if (!paidEnabled) {
                throw new BadRequestException(
                    'La venta de entradas con pago está deshabilitada para este organizador en este momento.',
                );
            }
        }

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

        // Send purchase confirmation email (fire-and-forget)
        try {
            const buyer = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true },
            });
            const event = await this.prisma.event.findUnique({
                where: { id: eventId },
                select: { title: true, date: true, location: true, city: true },
            });
            if (buyer && event) {
                const ticketInfos = seats.map((seat, i) => ({
                    ticketId: order.tickets[i]?.id || '',
                    eventTitle: event.title,
                    eventDate: event.date.toISOString(),
                    eventLocation: event.location,
                    eventCity: (event as any).city || '',
                    zoneName: seat.zone.name,
                    seatNumber: seat.number ?? null,
                }));
                this.mail.sendPurchaseConfirmation(
                    buyer.email,
                    buyer.name,
                    ticketInfos,
                    totalAmount,
                    order.id,
                ).catch(() => null);
            }
        } catch { /* email failure must never break the purchase */ }

        return {
            orderId: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            ticketCount: order.tickets.length,
            tickets: order.tickets,
        };
    }

    /**
     * Get orders for a user (paginated).
     */
    async getUserOrders(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                include: { tickets: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where: { userId } }),
        ]);

        // Enrich tickets with decoded QR info (event name, zone, seat, etc.)
        const data = await Promise.all(
            orders.map(async (order) => {
                const enrichedTickets = await Promise.all(
                    order.tickets.map(async (ticket) => {
                        try {
                            const decoded = this.jwtService.verify(ticket.qrCodeToken);
                            let eventTitle = 'Evento';
                            let eventDate = '';
                            let eventLocation = '';
                            let eventCity = '';
                            let eventSlug: string | null = null;
                            let hasSeatingChart = true;
                            if (decoded.eventId) {
                                const event = await this.prisma.event.findUnique({
                                    where: { id: decoded.eventId },
                                    select: { title: true, date: true, location: true, city: true, hasSeatingChart: true, slug: true },
                                });
                                if (event) {
                                    eventTitle = event.title;
                                    eventDate = event.date.toISOString();
                                    eventLocation = event.location;
                                    eventCity = event.city || '';
                                    hasSeatingChart = event.hasSeatingChart ?? true;
                                    eventSlug = event.slug || null;
                                }
                            }
                            return {
                                ...ticket,
                                eventId: decoded.eventId || null,
                                eventSlug,
                                eventTitle,
                                eventDate,
                                eventLocation,
                                eventCity,
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
                                eventCity: '',
                                zoneName: 'General',
                                seatNumber: '-',
                            };
                        }
                    }),
                );
                return { ...order, tickets: enrichedTickets };
            }),
        );

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    /**
     * Get all attendees for events owned by the organizer (paginated).
     */
    async getMyEventAttendees(organizerId: string, page = 1, limit = 20) {
        const myEvents = await this.prisma.event.findMany({
            where: { organizerId },
            select: { id: true, title: true },
        });

        if (!myEvents.length) return { data: [], total: 0, page, limit, totalPages: 0 };

        const myEventIds = new Set(myEvents.map((e) => e.id));
        const eventTitles = Object.fromEntries(myEvents.map((e) => [e.id, e.title]));

        const allTickets = await this.prisma.ticket.findMany({
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
                    },
                },
            },
        });

        type TicketEntry = {
            ticketId: string;
            status: string;
            scannedAt: Date | null;
            zoneName: string;
            seatNumber: string | number | null;
        };

        type AttendeeEntry = {
            user: { id: string; name: string; email: string; phone: string | null; avatarUrl: string | null };
            eventId: string;
            eventTitle: string;
            ticketsBought: number;
            ticketsUsed: number;
            tickets: TicketEntry[];
        };

        const grouped = new Map<string, AttendeeEntry>();

        for (const ticket of allTickets) {
            try {
                const decoded = this.jwtService.verify(ticket.qrCodeToken) as {
                    eventId: string; zoneName: string; seatNumber: string | number | null;
                };
                if (!myEventIds.has(decoded.eventId)) continue;

                const key = `${ticket.order.userId}-${decoded.eventId}`;
                if (!grouped.has(key)) {
                    grouped.set(key, {
                        user: ticket.order.user,
                        eventId: decoded.eventId,
                        eventTitle: eventTitles[decoded.eventId] || 'Evento',
                        ticketsBought: 0,
                        ticketsUsed: 0,
                        tickets: [],
                    });
                }
                const entry = grouped.get(key);
                if (!entry) continue;
                entry.ticketsBought++;
                if (ticket.status === 'USED') entry.ticketsUsed++;
                entry.tickets.push({
                    ticketId: ticket.id,
                    status: ticket.status,
                    scannedAt: ticket.scannedAt,
                    zoneName: decoded.zoneName || 'General',
                    seatNumber: decoded.seatNumber ?? null,
                });
            } catch {
                // token inválido, ignorar
            }
        }

        const sorted = Array.from(grouped.values()).sort((a, b) =>
            a.eventTitle.localeCompare(b.eventTitle),
        );

        const total = sorted.length;
        const skip = (page - 1) * limit;
        const data = sorted.slice(skip, skip + limit);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
}

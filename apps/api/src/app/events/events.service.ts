import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { CreateEventDto, UpdateEventDto, CreateZoneDto } from '@open-ticket/shared';
import { Prisma } from '@prisma/client';

function toSlug(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService, private mail: MailService, private jwt: JwtService) { }

    private getAnnualPeriodStart(profileCreatedAt: Date): Date {
        const now = new Date();
        const start = new Date(profileCreatedAt);
        // Advance anniversary year by year until the next one is in the future
        while (true) {
            const next = new Date(start);
            next.setFullYear(next.getFullYear() + 1);
            if (next > now) break;
            start.setFullYear(start.getFullYear() + 1);
        }
        return start;
    }

    private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
        const base = toSlug(title);
        let slug = base;
        let i = 2;
        while (true) {
            const existing = await this.prisma.event.findUnique({ where: { slug } });
            if (!existing || existing.id === excludeId) break;
            slug = `${base}-${i++}`;
        }
        return slug;
    }

    async getPaymentStatusForOrganizer(organizerId: string): Promise<boolean> {
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

    async create(organizerId: string, createEventDto: CreateEventDto) {
        const { zones, ...eventData } = createEventDto;

        if (new Date(eventData.date) < new Date()) {
            throw new BadRequestException('La fecha del evento no puede estar en el pasado');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: organizerId },
            include: { organizerProfile: true }
        });

        if (!user || !user.organizerProfile) {
            throw new BadRequestException('Usuario no tiene configurado un perfil de organizador válido.');
        }

        const profile = user.organizerProfile;

        if (profile.status === 'PENDING') {
            throw new BadRequestException('Tu cuenta de organizador está PENDIENTE de aprobación por el Administrador Global.');
        } else if (profile.status === 'REJECTED') {
            throw new BadRequestException('Tu cuenta de organizador fue rechazada.');
        }

        // Count events created within the current annual period (anniversary-based)
        const periodStart = this.getAnnualPeriodStart(profile.createdAt);
        const currentEventsCount = await this.prisma.event.count({
            where: { organizerId, createdAt: { gte: periodStart } }
        });
        
        // Fetch plan limits
        const planDetails = await this.prisma.plan.findUnique({
            where: { name: profile.plan }
        });

        if (planDetails) {
            // maxEvents === 0 means unlimited
            if (planDetails.maxEvents > 0 && currentEventsCount >= planDetails.maxEvents) {
                const renewDate = new Date(periodStart);
                renewDate.setFullYear(renewDate.getFullYear() + 1);
                const renewStr = renewDate.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
                throw new BadRequestException(`Has alcanzado el límite de ${planDetails.maxEvents} eventos para tu plan (${planDetails.name}). Tu cuota se renueva el ${renewStr}. Actualiza tu suscripción para publicar más.`);
            }
        } else {
            // Fallback for missing plan configurations
            if (profile.plan === 'FREE' && currentEventsCount >= 3) {
                throw new BadRequestException('Has alcanzado el límite de 3 eventos anuales para el plan FREE.');
            } else if (profile.plan === 'PLUS' && currentEventsCount >= 12) {
                throw new BadRequestException('Has alcanzado el límite de 12 eventos anuales para el plan PLUS. Usa ELITE para eventos ilimitados.');
            }
        }

        const slug = await this.generateUniqueSlug(eventData.title);

        // Resolve payment status using the already-fetched profile — avoid a redundant DB query
        let paidEnabled: boolean;
        if (profile.paidEventsEnabled !== null && profile.paidEventsEnabled !== undefined) {
            paidEnabled = profile.paidEventsEnabled;
        } else {
            const config = await this.prisma.systemConfig.upsert({
                where: { id: 'global' },
                create: { id: 'global', paidEventsEnabled: false },
                update: {},
            });
            paidEnabled = config.paidEventsEnabled;
        }
        if (!paidEnabled && zones?.length) {
            zones.forEach(z => { if (!z.sellOnSite) z.price = 0; });
        }

        return this.prisma.event.create({
            data: {
                ...(eventData as any),
                slug,
                organizer: { connect: { id: organizerId } },
                zones: {
                    create: zones.map(zone => ({
                        name: zone.name,
                        description: zone.description,
                        price: zone.sellOnSite ? 0 : zone.price,
                        capacity: zone.sellOnSite ? 0 : zone.capacity,
                        sellOnSite: zone.sellOnSite ?? false,
                        ...(zone.sellOnSite ? {} : {
                            seats: {
                                create: Array.from({ length: zone.capacity }).map((_, index) => ({
                                    number: `${index + 1}`,
                                    isSold: false,
                                })),
                            },
                        }),
                    })),
                },
            },
            include: { zones: true },
        });
    }

    private async updatePastEventsStatus() {
        const now = new Date();
        await this.prisma.event.updateMany({
            where: {
                status: 'PUBLISHED',
                date: { lt: now },
            },
            data: { status: 'INACTIVE' },
        });
    }

    async findAll(query?: string, page = 1, limit = 12) {
        await this.updatePastEventsStatus();
        const where: Prisma.EventWhereInput = { status: 'PUBLISHED' };

        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;
        const include = {
            zones: { include: { seats: true } },
            organizer: { select: { name: true, email: true, organizerProfile: { select: { organizationLogo: true, organizationName: true } } } },
        };

        const [data, total] = await Promise.all([
            this.prisma.event.findMany({ where, include, orderBy: { date: 'asc' }, skip, take: limit }),
            this.prisma.event.count({ where }),
        ]);

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findMyEvents(organizerId: string) {
        await this.updatePastEventsStatus();
        return this.prisma.event.findMany({
            where: { organizerId },
            include: { zones: { include: { seats: true } } },
            orderBy: { date: 'asc' },
        });
    }

    async findOne(idOrSlug: string) {
        await this.updatePastEventsStatus();
        const include = { zones: { include: { seats: true } }, organizer: { select: { name: true, email: true, organizerProfile: { select: { organizationLogo: true, organizationName: true } } } } };
        // Try slug first, then fall back to UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        const event = isUuid
            ? await this.prisma.event.findUnique({ where: { id: idOrSlug }, include })
            : await this.prisma.event.findUnique({ where: { slug: idOrSlug }, include });
        // Backfill slug if missing
        if (event && !event.slug) {
            const slug = await this.generateUniqueSlug(event.title, event.id);
            await this.prisma.event.update({ where: { id: event.id }, data: { slug } });
            event.slug = slug;
        }
        return event;
    }

    async backfillSlugs() {
        const events = await this.prisma.event.findMany({ where: { slug: null } });
        for (const ev of events) {
            const slug = await this.generateUniqueSlug(ev.title, ev.id);
            await this.prisma.event.update({ where: { id: ev.id }, data: { slug } });
        }
        return { updated: events.length };
    }

    private async notifyBuyersOfChange(
        eventId: string,
        type: 'canceled' | 'rescheduled',
        eventTitle: string,
        oldDate: string,
        newDate: string,
        newLocation: string,
        newCity: string,
    ) {
        // eventId is stored only in the ticket JWT — decode all tickets to find buyers
        const allTickets = await this.prisma.ticket.findMany({
            include: { order: { include: { user: { select: { id: true, email: true, name: true } } } } },
        });

        const notified = new Set<string>();
        for (const ticket of allTickets) {
            try {
                const decoded = this.jwt.verify(ticket.qrCodeToken) as { eventId: string };
                if (decoded.eventId !== eventId) continue;
                const user = ticket.order?.user;
                if (!user || notified.has(user.id)) continue;
                notified.add(user.id);
                const orderId = ticket.order.id;
                if (type === 'canceled') {
                    this.mail.sendEventCanceled(
                        user.email, user.name, eventTitle, oldDate, newLocation, newCity, orderId,
                    ).catch(() => null);
                } else {
                    this.mail.sendEventRescheduled(
                        user.email, user.name, eventTitle, oldDate, newDate, newLocation, newCity,
                    ).catch(() => null);
                }
            } catch { /* invalid token, skip */ }
        }
    }

    async update(id: string, updateData: UpdateEventDto) {
        const { zones, ...rawBasicData } = updateData;

        // Clean basicData: only include fields that exist on the Event model
        const allowedEventFields = [
            'title', 'description', 'date', 'location', 'province', 'city',
            'imageUrl', 'bannerImageUrl', 'squareImageUrl', 'portraitImageUrl', 'seatingMapImageUrl', 'hasSeatingChart', 'mapUrl',
            'videoUrl', 'galleryUrls', 'status', 'category'
        ];
        const basicData: Record<string, unknown> = {};
        for (const key of allowedEventFields) {
            if ((rawBasicData as Record<string, unknown>)[key] !== undefined) {
                basicData[key] = (rawBasicData as Record<string, unknown>)[key];
            }
        }
        // Convert date string to Date object for Prisma
        if (basicData.date && typeof basicData.date === 'string') {
            basicData.date = new Date(basicData.date);
        }

        // Notify buyers of cancellation or reschedule (fire-and-forget, before any DB write)
        const isStatusChange = basicData.status !== undefined;
        const isDateChange = basicData.date !== undefined;
        const isLocationChange = basicData.location !== undefined || basicData.city !== undefined;

        if (isStatusChange || isDateChange || isLocationChange) {
            const currentEvent = await this.prisma.event.findUnique({ where: { id } });
            if (currentEvent) {
                const oldDateStr = currentEvent.date.toISOString();
                const newDateStr = isDateChange ? (basicData.date as Date).toISOString() : oldDateStr;
                const newLocation = (basicData.location as string) || currentEvent.location;
                const newCity = (basicData.city as string) || currentEvent.city;

                if (isStatusChange && basicData.status === 'CANCELLED') {
                    this.notifyBuyersOfChange(
                        id, 'canceled', currentEvent.title, oldDateStr, newDateStr, currentEvent.location, currentEvent.city,
                    ).catch(() => null);
                } else if ((isDateChange || isLocationChange) && currentEvent.status === 'PUBLISHED') {
                    this.notifyBuyersOfChange(
                        id, 'rescheduled', currentEvent.title, oldDateStr, newDateStr, newLocation, newCity,
                    ).catch(() => null);
                }
            }
        }

        if (zones && zones.length > 0) {
            return this.prisma.$transaction(async (prisma) => {
                const existingEvent = await prisma.event.findUnique({
                    where: { id },
                    include: { zones: { include: { seats: true } } }
                });

                if (!existingEvent) {
                    throw new BadRequestException('Evento no encontrado');
                }

                const paidEnabled = await this.getPaymentStatusForOrganizer(existingEvent.organizerId);
                if (!paidEnabled && zones) {
                    zones.forEach((z: any) => { if (!z.sellOnSite) z.price = 0; });
                }

                const incomingZoneIds = new Set((zones || []).filter((z: CreateZoneDto) => z.id).map((z: CreateZoneDto) => z.id));

                // Remove zones deleted from the form, only if they have no sold seats
                for (const existingZone of existingEvent.zones) {
                    if (!incomingZoneIds.has(existingZone.id)) {
                        const hasSold = existingZone.seats.some(s => s.isSold);
                        if (hasSold) {
                            throw new BadRequestException(
                                `No se puede eliminar la zona "${existingZone.name}" porque ya tiene tickets vendidos.`
                            );
                        }
                        await prisma.seat.deleteMany({ where: { zoneId: existingZone.id } });
                        await prisma.zone.delete({ where: { id: existingZone.id } });
                    }
                }

                // Upsert zones
                for (const zone of zones || []) {
                    if (zone.id) {
                        // Find the existing zone to check sold seats for capacity protection
                        const existingZone = existingEvent.zones.find(ez => ez.id === zone.id);
                        const soldCount = existingZone
                            ? existingZone.seats.filter(s => s.isSold).length
                            : 0;
                        const newCapacity = Number(zone.capacity);

                        // Cannot reduce capacity below the number of sold seats
                        if (newCapacity < soldCount) {
                            throw new BadRequestException(
                                `La zona "${zone.name}" tiene ${soldCount} entradas vendidas. No se puede reducir la capacidad por debajo de ese número.`
                            );
                        }

                        // Update zone metadata
                        await prisma.zone.update({
                            where: { id: zone.id },
                            data: {
                                name: zone.name,
                                description: zone.description || null,
                                price: zone.sellOnSite ? 0 : zone.price,
                                capacity: zone.sellOnSite ? 0 : newCapacity,
                                sellOnSite: zone.sellOnSite ?? false,
                            }
                        });

                        // Handle seat count changes
                        if (existingZone) {
                            const currentSeatCount = existingZone.seats.length;
                            if (newCapacity > currentSeatCount) {
                                // Add more seats
                                const seatsToAdd = newCapacity - currentSeatCount;
                                await prisma.seat.createMany({
                                    data: Array.from({ length: seatsToAdd }).map((_, i) => ({
                                        zoneId: zone.id,
                                        number: `${currentSeatCount + i + 1}`,
                                        isSold: false,
                                    }))
                                });
                            } else if (newCapacity < currentSeatCount) {
                                // Remove unsold seats from the end
                                const unsoldSeats = existingZone.seats
                                    .filter(s => !s.isSold)
                                    .sort((a, b) => Number(b.number) - Number(a.number));
                                const seatsToRemove = currentSeatCount - newCapacity;
                                const seatsToDelete = unsoldSeats.slice(0, seatsToRemove);
                                if (seatsToDelete.length > 0) {
                                    await prisma.seat.deleteMany({
                                        where: { id: { in: seatsToDelete.map(s => s.id) } }
                                    });
                                }
                            }
                        }
                    } else {
                        // Create new zone with seats
                        const newCapacity = Number(zone.capacity);
                        await prisma.zone.create({
                            data: {
                                eventId: id,
                                name: zone.name,
                                description: zone.description || null,
                                price: zone.sellOnSite ? 0 : zone.price,
                                capacity: zone.sellOnSite ? 0 : newCapacity,
                                sellOnSite: zone.sellOnSite ?? false,
                                ...(zone.sellOnSite ? {} : {
                                    seats: {
                                        create: Array.from({ length: newCapacity }).map((_, i) => ({
                                            number: `${i + 1}`,
                                            isSold: false
                                        }))
                                    }
                                }),
                            }
                        });
                    }
                }

                // Update event basic data
                if (Object.keys(basicData).length > 0) {
                    await prisma.event.update({
                        where: { id },
                        data: basicData,
                    });
                }

                // Return the full updated event
                return prisma.event.findUnique({
                    where: { id },
                    include: { zones: { include: { seats: true } } }
                });
            });
        }

        // No zones to update, just update basic event data
        return this.prisma.event.update({
            where: { id },
            data: basicData,
        });
    }

    async remove(id: string) {
        // Find if any seats are sold
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { zones: { include: { seats: true } } }
        });
        
        if (!event) throw new Error('Event not found');
        
        const hasSoldSeats = event.zones.some(z => z.seats.some(s => s.isSold));
        if (hasSoldSeats) {
            throw new Error('Cannot delete event with sold tickets');
        }

        return this.prisma.$transaction([
            this.prisma.seat.deleteMany({ where: { zone: { eventId: id } } }),
            this.prisma.zone.deleteMany({ where: { eventId: id } }),
            this.prisma.event.delete({ where: { id } }),
        ]);
    }
}

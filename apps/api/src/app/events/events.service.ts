import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
    constructor(private prisma: PrismaService) { }

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

    async create(organizerId: string, createEventDto: CreateEventDto) {
        const { zones, ...eventData } = createEventDto;

        if (new Date(eventData.date) < new Date()) {
            throw new BadRequestException('La fecha del evento no puede estar en el pasado');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: organizerId },
            include: { organizerProfile: true, _count: { select: { eventsOwned: true } } }
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

        const currentEventsCount = user._count.eventsOwned;
        
        // Fetch plan limits
        const planDetails = await this.prisma.plan.findUnique({
            where: { name: profile.plan }
        });

        if (planDetails) {
            // maxEvents === 0 means unlimited
            if (planDetails.maxEvents > 0 && currentEventsCount >= planDetails.maxEvents) {
                throw new BadRequestException(`Has alcanzado el límite de ${planDetails.maxEvents} eventos permitidos en tu plan (${planDetails.name}). Actualiza tu suscripción para seguir publicando.`);
            }
        } else {
            // Fallback for missing plan configurations
            if (profile.plan === 'FREE' && currentEventsCount >= 3) {
                throw new BadRequestException('Has alcanzado el límite de 3 eventos para el plan Gratuito. Sube a PLUS para más.');
            } else if (profile.plan === 'PLUS' && currentEventsCount >= 12) {
                throw new BadRequestException('Has alcanzado el límite de 12 eventos para el plan PLUS. Usa ELITE para eventos ilimitados.');
            }
        }

        const slug = await this.generateUniqueSlug(eventData.title);
        return this.prisma.event.create({
            data: {
                ...(eventData as any),
                slug,
                organizer: { connect: { id: organizerId } },
                zones: {
                    create: zones.map(zone => ({
                        name: zone.name,
                        description: zone.description,
                        price: zone.price,
                        capacity: zone.capacity,
                        seats: {
                            create: Array.from({ length: zone.capacity }).map((_, index) => ({
                                number: `${index + 1}`,
                                isSold: false,
                            })),
                        },
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

    async findAll(query?: string) {
        await this.updatePastEventsStatus();
        const where: Prisma.EventWhereInput = {};
        
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } },
            ];
        }

        return this.prisma.event.findMany({
            where,
            include: { zones: { include: { seats: true } }, organizer: { select: { name: true, email: true, organizerProfile: { select: { organizationLogo: true, organizationName: true } } } } },
            orderBy: { date: 'asc' },
        });
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

        if (zones && zones.length > 0) {
            return this.prisma.$transaction(async (prisma) => {
                const existingEvent = await prisma.event.findUnique({
                    where: { id },
                    include: { zones: { include: { seats: true } } }
                });

                if (!existingEvent) {
                    throw new BadRequestException('Evento no encontrado');
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
                                price: zone.price,
                                capacity: newCapacity,
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
                                price: zone.price,
                                capacity: newCapacity,
                                seats: {
                                    create: Array.from({ length: newCapacity }).map((_, i) => ({
                                        number: `${i + 1}`,
                                        isSold: false
                                    }))
                                }
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

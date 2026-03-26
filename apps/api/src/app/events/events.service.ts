import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from '@open-ticket/shared';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async create(organizerId: string, createEventDto: CreateEventDto) {
        console.log('--- CREATE EVENT DTO ---', createEventDto);
        const { zones, ...eventData } = createEventDto;

        if (new Date(eventData.date) < new Date()) {
            throw new BadRequestException('La fecha del evento no puede estar en el pasado');
        }

        // Simplistic seat generation for demonstration
        // In production, this would be more complex based on layout
        return this.prisma.event.create({
            data: {
                ...(eventData as any),
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
        const where: any = {};
        
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } },
            ];
        }

        return this.prisma.event.findMany({
            where,
            include: { zones: true, organizer: { select: { name: true, email: true } } },
            orderBy: { date: 'asc' },
        });
    }

    async findOne(id: string) {
        await this.updatePastEventsStatus();
        return this.prisma.event.findUnique({
            where: { id },
            include: { zones: { include: { seats: true } }, organizer: { select: { name: true, email: true } } },
        });
    }

    async update(id: string, updateData: any) {
        // If zones are provided, we'd need more complex logic.
        // For now let's just update the basic event details.
        const { zones, ...basicData } = updateData;

        if (basicData.date && new Date(basicData.date) < new Date()) {
            throw new BadRequestException('La fecha del evento no puede estar en el pasado');
        }

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

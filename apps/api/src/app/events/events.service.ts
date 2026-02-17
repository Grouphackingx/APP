import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from '@open-ticket/shared';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async create(organizerId: string, createEventDto: CreateEventDto) {
        const { zones, ...eventData } = createEventDto;

        // Simplistic seat generation for demonstration
        // In production, this would be more complex based on layout
        return this.prisma.event.create({
            data: {
                ...eventData,
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

    findAll(query?: string) {
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

    findOne(id: string) {
        return this.prisma.event.findUnique({
            where: { id },
            include: { zones: { include: { seats: true } }, organizer: { select: { name: true, email: true } } },
        });
    }
}

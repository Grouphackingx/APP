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

    findAll() {
        return this.prisma.event.findMany({
            include: { zones: true, organizer: { select: { name: true, email: true } } },
        });
    }

    findOne(id: string) {
        return this.prisma.event.findUnique({
            where: { id },
            include: { zones: { include: { seats: true } }, organizer: { select: { name: true, email: true } } },
        });
    }
}

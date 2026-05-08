import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TicketsService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async validateByTicketId(partialId: string, staffId: string) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { id: { startsWith: partialId.toLowerCase().replace(/^#/, '') } },
        });
        if (!ticket) {
            throw new NotFoundException(`No se encontró ningún ticket con ID que empiece por "${partialId}"`);
        }
        return this.validateTicket(ticket.qrCodeToken, staffId);
    }

    async validateTicket(token: string, staffId: string) {
        try {
            // 1. Verify JWT signature
            const payload = this.jwtService.verify(token);

            // 2. Find ticket in DB
            const ticket = await this.prisma.ticket.findUnique({
                where: { id: payload.ticketId, qrCodeToken: token },
                include: {
                    order: {
                        include: { user: true }
                    }
                }
            });

            if (!ticket) {
                throw new NotFoundException('Ticket inválido o no encontrado en el sistema');
            }

            // 3. Check status
            if (ticket.status === 'USED') {
                throw new ConflictException({
                    message: 'Este ticket YA FUE USADO anteriormente',
                    scannedAt: ticket.scannedAt,
                    user: ticket.order.user.name
                });
            }

            if (ticket.status !== 'VALID') {
                throw new BadRequestException(`Ticket no válido (Estado: ${ticket.status})`);
            }

            // 4. Mark as USED
            const updatedTicket = await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    status: 'USED',
                    scannedAt: new Date()
                }
            });

            return {
                valid: true,
                message: 'Acceso Permitido',
                ticket: {
                    id: ticket.id,
                    eventName: 'Evento', // Idealmente vendría del payload o relación
                    zone: payload.zoneName,
                    seat: payload.seatNumber,
                    holderName: ticket.order.user.name,
                    scannedAt: updatedTicket.scannedAt
                }
            };

        } catch (error: any) {
            if (error.name === 'JsonWebTokenError') {
                throw new BadRequestException('El código QR está corrupto o fue manipulado');
            }
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException('El ticket ha expirado');
            }
            throw error;
        }
    }
}

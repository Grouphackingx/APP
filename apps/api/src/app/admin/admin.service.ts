import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private jwtService: JwtService,
  ) {}

  async getAllOrganizers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { role: 'HOST' as 'HOST' };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { organizerProfile: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrganizersAnalytics() {
    const organizers = await this.prisma.user.findMany({
      where: { role: 'HOST' },
      include: {
        organizerProfile: true,
        eventsOwned: {
          include: {
            zones: {
              include: {
                seats: {
                  where: { isSold: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return organizers
      // Excluimos organizadores en Modo Prueba: sus ventas simuladas no deben
      // contaminar las analíticas/ingresos reales del panel.
      .filter(org => !org.organizerProfile?.isTestMode)
      .map(org => {
      let totalZones = 0;
      let totalTicketsSold = 0;
      let totalRevenue = 0;

      org.eventsOwned.forEach(event => {
        totalZones += event.zones.length;
        event.zones.forEach(zone => {
          const soldInZone = zone.seats.length;
          totalTicketsSold += soldInZone;
          totalRevenue += soldInZone * Number(zone.price);
        });
      });

      return {
        id: org.id,
        name: org.organizerProfile?.organizationName || org.name,
        email: org.email,
        plan: org.organizerProfile?.plan,
        status: org.organizerProfile?.status,
        eventsCount: org.eventsOwned.length,
        zonesCount: totalZones,
        ticketsSold: totalTicketsSold,
        revenue: totalRevenue
      };
    });
  }

  async createOrganizer(data: any) {
    const { email, password, firstName, lastName, identificationNumber, phone, organizationName, organizationDescription, organizationLogo, address, province, city, plan, status } = data;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Ya existe un usuario con este correo');

    const rawPassword = password || 'host123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        role: 'HOST',
        organizerProfile: {
          create: {
            firstName,
            lastName,
            identificationNumber,
            phone,
            organizationName,
            organizationDescription: organizationDescription || null,
            organizationLogo: organizationLogo || null,
            address,
            province,
            city,
            plan: plan || 'FREE',
            status: status || 'APPROVED',
          }
        }
      },
      include: { organizerProfile: true }
    });

    if (organizationLogo) {
      const tempIdMatch = organizationLogo.match(/\/uploads\/organizers\/([^\/]+)\//);
      const tempId = tempIdMatch ? tempIdMatch[1] : null;
      
      if (tempId && tempId !== user.id) {
          const fs = require('fs');
          const tempDir = `./uploads/organizers/${tempId}`;
          const newDir = `./uploads/organizers/${user.id}`;
          
          if (fs.existsSync(tempDir)) {
              try {
                  fs.renameSync(tempDir, newDir);
                  const newLogoUrl = organizationLogo.replace(`/organizers/${tempId}/`, `/organizers/${user.id}/`);
                  await this.prisma.organizerProfile.update({
                      where: { userId: user.id },
                      data: { organizationLogo: newLogoUrl }
                  });
                  if (user.organizerProfile) {
                      user.organizerProfile.organizationLogo = newLogoUrl;
                  }
              } catch (e) {
                  console.error('Failed to move logo directory', e);
              }
          }
      }
    }

    this.mail.sendAccountCreatedByAdmin(
      user.email, user.name, user.email, rawPassword, 'HOST', organizationName,
    ).catch(() => null);

    return user;
  }

  async setOrganizerStatus(userId: string, status: any, reason?: string) {
    const profile = await this.prisma.organizerProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Organizer profile not found for this user');
    }

    const updated = await this.prisma.organizerProfile.update({
      where: { userId },
      data: { status },
    });

    const { email, name } = (profile as any).user;
    const orgName = profile.organizationName;

    if (status === 'APPROVED') {
      this.mail.sendHostApproved(email, name, orgName).catch(() => null);
    } else if (status === 'REJECTED') {
      this.mail.sendHostRejected(email, name, orgName, reason).catch(() => null);
    }

    return updated;
  }

  async updateOrganizer(userId: string, data: any) {
    const { id, userId: uid, createdAt, updatedAt, email, password, ...updatePayload } = data;
    
    const userUpdate: any = {};
    if (email) userUpdate.email = email;
    if (password) userUpdate.password = await bcrypt.hash(password, 10);

    if (Object.keys(userUpdate).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdate
      });
    }

    if (Object.keys(updatePayload).length > 0) {
      return this.prisma.organizerProfile.update({
        where: { userId },
        data: updatePayload
      });
    }
    
    return { success: true };
  }

  async deleteOrganizer(userId: string) {
    // Delete profile first, then user to avoid foreign key cascading issues if not set
    await this.prisma.organizerProfile.delete({ where: { userId } }).catch(() => null);
    return this.prisma.user.delete({
      where: { id: userId }
    });
  }

  // --- PLANS MANAGEMENT ---

  async getAllPlans() {
    return this.prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
  }

  async createPlan(data: any) {
    return this.prisma.plan.create({
      data: {
        name: data.name,
        maxEvents: Number(data.maxEvents),
        price: Number(data.price),
      }
    });
  }

  async updatePlan(id: string, data: any) {
    return this.prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        maxEvents: data.maxEvents !== undefined ? Number(data.maxEvents) : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
      }
    });
  }

  async deletePlan(id: string) {
    return this.prisma.plan.delete({
      where: { id }
    });
  }

  // --- ADMIN USERS MANAGEMENT ---

  async getAdminUsers() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'EDITOR'] } },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createAdminUser(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Ya existe un usuario con este correo');

    const rawPassword = data.password || 'admin123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const user = await this.prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });

    this.mail.sendAccountCreatedByAdmin(
      user.email, user.name, user.email, rawPassword, user.role as 'ADMIN' | 'EDITOR',
    ).catch(() => null);

    return user;
  }

  async updateAdminUser(id: string, data: any) {
    const updateData: any = {};
    if (data.firstName && data.lastName) updateData.name = `${data.firstName} ${data.lastName}`.trim();
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
  }

  async deleteAdminUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // --- EVENTS MANAGEMENT ---

  async getAllEvents(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const include = {
      organizer: { include: { organizerProfile: true } },
      zones: { include: { seats: true } },
    };
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({ include, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      this.prisma.event.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async impersonateOrganizer(targetUserId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { organizerProfile: true },
    });
    if (!user || user.role !== 'HOST' || !user.organizerProfile)
      throw new NotFoundException('Organizador no encontrado');
    if (user.organizerProfile.status !== 'APPROVED')
      throw new ForbiddenException('Solo se puede acceder como organizadores APPROVED');

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
      organizerProfileId: user.organizerProfile.id,
      impersonatedBy: adminId,
    };
    return { impersonation_token: this.jwtService.sign(payload) };
  }

  // --- SYSTEM CONFIG / PAYMENT GATEWAY ---

  async getConfig() {
    return this.prisma.systemConfig.upsert({
      where: { id: 'global' },
      create: { id: 'global', paidEventsEnabled: false },
      update: {},
    });
  }

  async updateConfig(paidEventsEnabled: boolean) {
    return this.prisma.systemConfig.upsert({
      where: { id: 'global' },
      create: { id: 'global', paidEventsEnabled },
      update: { paidEventsEnabled },
    });
  }

  async setOrgPaymentGateway(userId: string, paidEventsEnabled: boolean | null) {
    const profile = await this.prisma.organizerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Organizador no encontrado');
    return this.prisma.organizerProfile.update({
      where: { userId },
      data: { paidEventsEnabled },
    });
  }

  // --- TEST MODE (organizador sandbox) ---

  async setOrgTestMode(userId: string, isTestMode: boolean) {
    const profile = await this.prisma.organizerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Organizador no encontrado');
    return this.prisma.organizerProfile.update({
      where: { userId },
      data: { isTestMode },
    });
  }

  /**
   * Borrado forzado de un evento (admin), incluyendo sus tickets/órdenes vendidos.
   * SOLO permitido si el dueño está marcado como organizador de prueba (isTestMode),
   * para que nunca se borren ventas reales por accidente.
   *
   * Órdenes y tickets no tienen FK al evento: la relación vive dentro del JWT del
   * qrCodeToken (eventId/seatId), así que los identificamos decodificando.
   */
  async forceDeleteEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: { include: { organizerProfile: true } },
        zones: { include: { seats: { select: { id: true } } } },
      },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');

    if (!event.organizer?.organizerProfile?.isTestMode) {
      throw new ForbiddenException(
        'El borrado forzado solo está permitido para organizadores en Modo Prueba.',
      );
    }

    // IDs de asientos de este evento → para emparejar tickets por su JWT.
    const seatIds = new Set(event.zones.flatMap((z) => z.seats.map((s) => s.id)));

    // Buscar tickets cuyo QR (JWT) pertenezca a este evento; juntar sus órdenes.
    const allTickets = await this.prisma.ticket.findMany({
      select: { id: true, orderId: true, qrCodeToken: true },
    });
    const ticketIds: string[] = [];
    const orderIds = new Set<string>();
    for (const t of allTickets) {
      try {
        const decoded: any = this.jwtService.verify(t.qrCodeToken);
        if (decoded.eventId === eventId || (decoded.seatId && seatIds.has(decoded.seatId))) {
          ticketIds.push(t.id);
          orderIds.add(t.orderId);
        }
      } catch {
        // token inválido/expirado → no podemos atribuirlo a este evento, lo ignoramos
      }
    }

    await this.prisma.$transaction([
      this.prisma.ticket.deleteMany({ where: { id: { in: ticketIds } } }),
      // Una orden = un checkout de un solo evento, por lo que es seguro borrarlas.
      this.prisma.order.deleteMany({ where: { id: { in: Array.from(orderIds) } } }),
      this.prisma.seat.deleteMany({ where: { zone: { eventId } } }),
      this.prisma.zone.deleteMany({ where: { eventId } }),
      this.prisma.event.delete({ where: { id: eventId } }),
    ]);

    return {
      deleted: true,
      eventId,
      ticketsDeleted: ticketIds.length,
      ordersDeleted: orderIds.size,
    };
  }

  /**
   * Reset de ventas (admin): deja el evento como recién publicado. Libera los
   * asientos vendidos (isSold=false) y borra sus tickets/órdenes, pero CONSERVA
   * el evento, sus zonas, precios y capacidad. Para repetir pruebas de compra
   * sobre el mismo evento. Solo permitido en organizadores de prueba.
   */
  async resetEventSales(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: { include: { organizerProfile: true } },
        zones: { include: { seats: { select: { id: true } } } },
      },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');

    if (!event.organizer?.organizerProfile?.isTestMode) {
      throw new ForbiddenException(
        'El reset de ventas solo está permitido para organizadores en Modo Prueba.',
      );
    }

    const seatIds = new Set(event.zones.flatMap((z) => z.seats.map((s) => s.id)));

    // Localizar tickets de este evento por su JWT (no hay FK directa al evento).
    const allTickets = await this.prisma.ticket.findMany({
      select: { id: true, orderId: true, qrCodeToken: true },
    });
    const ticketIds: string[] = [];
    const orderIds = new Set<string>();
    for (const t of allTickets) {
      try {
        const decoded: any = this.jwtService.verify(t.qrCodeToken);
        if (decoded.eventId === eventId || (decoded.seatId && seatIds.has(decoded.seatId))) {
          ticketIds.push(t.id);
          orderIds.add(t.orderId);
        }
      } catch {
        // token inválido/expirado → no atribuible a este evento, lo ignoramos
      }
    }

    await this.prisma.$transaction([
      this.prisma.ticket.deleteMany({ where: { id: { in: ticketIds } } }),
      this.prisma.order.deleteMany({ where: { id: { in: Array.from(orderIds) } } }),
      // Liberar asientos: vuelven a estar disponibles para la venta.
      this.prisma.seat.updateMany({ where: { zone: { eventId } }, data: { isSold: false } }),
    ]);

    return {
      reset: true,
      eventId,
      seatsReleased: seatIds.size,
      ticketsDeleted: ticketIds.length,
      ordersDeleted: orderIds.size,
    };
  }

  // --- ATTENDEES (USER role) ---

  async getAttendees(page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const where: any = { role: 'USER' as const };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true,
          isBlocked: true, emailVerified: true, createdAt: true,
          orders: {
            select: {
              id: true, status: true,
              tickets: { select: { id: true, status: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const mapped = data.map(u => {
      const allTickets = u.orders.flatMap(o => o.tickets);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isBlocked: u.isBlocked,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        totalOrders: u.orders.length,
        totalTickets: allTickets.length,
        usedTickets: allTickets.filter(t => t.status === 'USED').length,
        validTickets: allTickets.filter(t => t.status === 'VALID').length,
      };
    });
    return { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async exportAttendees(search = '') {
    const where: any = { role: 'USER' as const };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const data = await this.prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        isBlocked: true, emailVerified: true, createdAt: true,
        orders: { select: { id: true, tickets: { select: { id: true, status: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(u => {
      const allTickets = u.orders.flatMap(o => o.tickets);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        isBlocked: u.isBlocked,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        totalOrders: u.orders.length,
        totalTickets: allTickets.length,
        usedTickets: allTickets.filter(t => t.status === 'USED').length,
        validTickets: allTickets.filter(t => t.status === 'VALID').length,
      };
    });
  }

  async updateAttendee(id: string, data: { name?: string; email?: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'USER') throw new NotFoundException('Asistente no encontrado');
    if (data.email && data.email !== existing.email) {
      const conflict = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (conflict) throw new ConflictException('Ya existe un usuario con ese correo');
    }
    const { name, email, phone } = data;
    return this.prisma.user.update({ where: { id }, data: { ...(name && { name }), ...(email && { email }), ...(phone !== undefined && { phone }) } });
  }

  async deleteAttendee(id: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
    if (!existing || existing.role !== 'USER') throw new NotFoundException('Asistente no encontrado');
    if ((existing as any)._count.orders > 0) {
      throw new ForbiddenException(
        'No se puede eliminar este asistente porque tiene órdenes de compra registradas. Usa la opción "Bloquear" para restringir su acceso.',
      );
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async blockAttendee(id: string, isBlocked: boolean) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'USER') throw new NotFoundException('Asistente no encontrado');
    return this.prisma.user.update({ where: { id }, data: { isBlocked } });
  }

  async changeAttendeePassword(id: string, newPassword: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'USER') throw new NotFoundException('Asistente no encontrado');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
    return { message: 'Contraseña actualizada correctamente' };
  }

  async toggleEventFeatured(id: string, isFeatured: boolean, durationDays?: number) {
    let featuredUntil = null;
    
    if (isFeatured && durationDays) {
      const date = new Date();
      date.setDate(date.getDate() + durationDays);
      featuredUntil = date;
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        isFeatured,
        featuredUntil
      }
    });
  }
}

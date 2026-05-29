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
    const where = { role: 'HOST' as const };
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

    return organizers.map(org => {
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

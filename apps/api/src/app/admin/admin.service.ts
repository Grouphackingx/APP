import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllOrganizers() {
    return this.prisma.user.findMany({
      where: { role: 'HOST' },
      include: { organizerProfile: true },
      orderBy: { createdAt: 'desc' }
    });
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
    const { email, password, firstName, lastName, identificationNumber, phone, organizationName, organizationDescription, address, province, city, plan, status } = data;
    
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Ya existe un usuario con este correo');

    const hashedPassword = await bcrypt.hash(password || 'host123', 10);
    
    return this.prisma.user.create({
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
  }

  async setOrganizerStatus(userId: string, status: any) {
    const profile = await this.prisma.organizerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Organizer profile not found for this user');
    }

    return this.prisma.organizerProfile.update({
      where: { userId },
      data: { status }
    });
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

    const hashedPassword = await bcrypt.hash(data.password || 'admin123', 10);
    return this.prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role // 'ADMIN' or 'EDITOR'
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
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
}

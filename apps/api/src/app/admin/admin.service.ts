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
    const { id, userId: uid, createdAt, updatedAt, email, ...updatePayload } = data;
    
    if (email) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email }
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
}

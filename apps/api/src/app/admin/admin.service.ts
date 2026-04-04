import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}

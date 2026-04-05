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
}

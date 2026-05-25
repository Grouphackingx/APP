import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  create(data: { imageUrl: string; linkUrl?: string; title?: string; isActive?: boolean; order?: number }) {
    return this.prisma.banner.create({ data });
  }

  async update(id: string, data: { imageUrl?: string; linkUrl?: string; title?: string; isActive?: boolean; order?: number }) {
    await this.findOne(id);
    return this.prisma.banner.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.banner.delete({ where: { id } });
  }

  private async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }
}

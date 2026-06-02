import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CATEGORIES = [
  { name: 'Música',       icon: '🎵', order: 1 },
  { name: 'Baile',        icon: '💃', order: 2 },
  { name: 'Cultura',      icon: '🎭', order: 3 },
  { name: 'Fiestas',      icon: '🎉', order: 4 },
  { name: 'Festival',     icon: '🌟', order: 5 },
  { name: 'Conciertos',   icon: '🎤', order: 6 },
  { name: 'Deportes',     icon: '⚽', order: 7 },
  { name: 'Gastronomía',  icon: '🍽️', order: 8 },
  { name: 'Arte',         icon: '🎨', order: 9 },
  { name: 'Teatro',       icon: '🎬', order: 10 },
  { name: 'Conferencia',  icon: '🎙️', order: 11 },
  { name: 'Fiestas y Bailes', icon: '🕺', order: 12 },
  { name: 'Otro',         icon: '📌', order: 99 },
];

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(withEvents = false) {
    const categories = await this.prisma.eventCategory.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    if (!withEvents) return categories;
    const now = new Date();
    // Only count events that would appear in the general grid:
    // published AND not currently featured (isFeatured=false, or featured but already expired)
    const rows = await this.prisma.event.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED',
        OR: [
          { isFeatured: false },
          { isFeatured: true, featuredUntil: { lt: now } },
        ],
      },
    });
    const generalCats = new Set(rows.map(r => r.category));
    return categories.filter(c => generalCats.has(c.name));
  }

  async findAllAdmin() {
    const categories = await this.prisma.eventCategory.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    const counts = await this.prisma.event.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    const countMap = new Map(counts.map(c => [c.category, c._count.category]));
    return categories.map(cat => ({ ...cat, eventCount: countMap.get(cat.name) ?? 0 }));
  }

  async create(data: { name: string; icon?: string; order?: number }) {
    const existing = await this.prisma.eventCategory.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictException(`La categoría "${data.name}" ya existe.`);
    return this.prisma.eventCategory.create({ data });
  }

  async update(id: string, data: { name?: string; icon?: string; order?: number; isActive?: boolean }) {
    const cat = await this.prisma.eventCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada.');
    if (data.name && data.name !== cat.name) {
      const existing = await this.prisma.eventCategory.findUnique({ where: { name: data.name } });
      if (existing) throw new ConflictException(`La categoría "${data.name}" ya existe.`);
      // Update events that use the old name
      await this.prisma.event.updateMany({
        where: { category: cat.name },
        data: { category: data.name },
      });
    }
    return this.prisma.eventCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    const cat = await this.prisma.eventCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada.');
    const eventCount = await this.prisma.event.count({ where: { category: cat.name } });
    if (eventCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar "${cat.name}" porque tiene ${eventCount} evento(s) asociado(s). Reasigna los eventos primero.`
      );
    }
    return this.prisma.eventCategory.delete({ where: { id } });
  }

  async seed() {
    let created = 0;
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await this.prisma.eventCategory.findUnique({ where: { name: cat.name } });
      if (!exists) {
        await this.prisma.eventCategory.create({ data: cat });
        created++;
      }
    }
    return { created, message: `${created} categorías creadas.` };
  }
}

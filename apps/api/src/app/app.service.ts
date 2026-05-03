import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
  }
}

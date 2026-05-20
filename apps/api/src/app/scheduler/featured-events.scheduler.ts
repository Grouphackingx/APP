import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturedEventsScheduler {
  private readonly logger = new Logger(FeaturedEventsScheduler.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireFeaturedEvents() {
    const now = new Date();
    const result = await this.prisma.event.updateMany({
      where: {
        isFeatured: true,
        featuredUntil: { not: null, lt: now },
      },
      data: {
        isFeatured: false,
        featuredUntil: null,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} featured event(s).`);
    }
  }
}

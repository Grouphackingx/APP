import { Module } from '@nestjs/common';
import { FeaturedEventsScheduler } from './featured-events.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FeaturedEventsScheduler],
})
export class SchedulerModule {}

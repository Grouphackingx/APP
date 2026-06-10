import { Module } from '@nestjs/common';
import { FeaturedEventsScheduler } from './featured-events.scheduler';
import { OrphanedUploadsScheduler } from './orphaned-uploads.scheduler';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FeaturedEventsScheduler, OrphanedUploadsScheduler],
})
export class SchedulerModule {}

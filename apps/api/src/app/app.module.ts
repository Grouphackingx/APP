import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { OrganizerMembersModule } from './organizer-members/organizer-members.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { MailModule } from './mail/mail.module';
import { BannersModule } from './banners/banners.module';
import { CategoriesModule } from './categories/categories.module';
import { OgImageModule } from './og-image/og-image.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },
      { name: 'medium', ttl: 10000, limit: 60  },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      // Los nombres de archivo son UUID inmutables: al reemplazar un logo/avatar
      // se genera un UUID nuevo (URL nueva), así que es seguro cachear 1 año.
      // Elimina la re-descarga de imágenes en cada visita (Expires headers).
      serveStaticOptions: {
        maxAge: '365d',
        immutable: true,
      },
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    EventsModule,
    OrdersModule,
    TicketsModule,
    PaymentsModule,
    UploadModule,
    AdminModule,
    OrganizerMembersModule,
    SchedulerModule,
    MailModule,
    BannersModule,
    CategoriesModule,
    OgImageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }

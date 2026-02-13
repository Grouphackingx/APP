import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [
        PaymentsModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            signOptions: { expiresIn: '365d' },
        }),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }

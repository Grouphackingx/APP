
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(JwtAuthGuard)
    @Post('create-intent')
    createIntent(@Body() body: { amount: number }) {
        return this.paymentsService.createPaymentIntent(body.amount);
    }
}

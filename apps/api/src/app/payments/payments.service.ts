
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake', {
        });
    }

    async createPaymentIntent(amount: number, currency = 'usd') {
        try {
            // For MVP/Demo without real credentials, return a mock intent
            if (!process.env.STRIPE_SECRET_KEY) {
                return {
                    id: `pi_mock_${Date.now()}`,
                    client_secret: `secret_mock_${Date.now()}`,
                    amount,
                    currency,
                    status: 'succeeded' // Simulate auto-success for now
                };
            }

            return await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // cents
                currency,
                payment_method_types: ['card'],
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error creating payment intent');
        }
    }

    // Process payment synchronously (for simple flow)
    async processPayment(token: string, amount: number): Promise<boolean> {
        console.log(`Processing mock payment for ${amount} with token ${token}`);
        // In a real flow, we would confirm the PaymentIntent here
        // or verify the token with Stripe
        return true; 
    }
}

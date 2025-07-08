import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  constructor(@Inject('STRIPE') private readonly stripeClient: Stripe) {}

  async paymentBooks(price: number): Promise<string | null> {
    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: price * 100,
      currency: 'usd',
    });

    return paymentIntent.client_secret;
  }
}

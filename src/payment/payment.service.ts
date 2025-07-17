import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentBooksDto } from './dto/payment-books.dto';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('STRIPE') private readonly stripeClient: Stripe,
    private readonly customerService: CustomerService,
  ) {}

  async paymentBooks(body: PaymentBooksDto, userID: string): Promise<string | null> {
    const customer = await this.customerService.getCustomer(userID);
    const card = await this.customerService.attachPaymentMethod(body.paymentMethod, userID);

    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: body.price * 100,
      currency: 'usd',
      payment_method: card.id,
      customer: String(customer.id),
    });

    return paymentIntent.client_secret;
  }
}

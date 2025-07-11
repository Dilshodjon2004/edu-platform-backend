import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';

export const STRIPE = 'STRIPE';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: STRIPE,
      useFactory: () => {
        return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2022-11-15',
        });
      },
    },
  ],
  exports: ['STRIPE'],
})
export class PaymentModule {}

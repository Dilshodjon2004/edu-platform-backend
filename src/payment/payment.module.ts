import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import Stripe from 'stripe';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerModule } from 'src/customer/customer.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.model';

export const STRIPE = 'STRIPE';

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => CustomerModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
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
    CustomerService,
  ],
  exports: ['STRIPE'],
})
export class PaymentModule {}

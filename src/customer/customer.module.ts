import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.model';
import { PaymentModule } from 'src/payment/payment.module';

export const STRIPE = 'STRIPE';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), PaymentModule],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}

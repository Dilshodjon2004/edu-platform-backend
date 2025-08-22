import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.model';
import { STRIPE } from 'src/payment/payment.module';
import Stripe from 'stripe';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [
    UserService,
    {
      provide: STRIPE,
      useFactory: () => {
        return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2022-11-15',
        });
      },
    },
  ],
  controllers: [UserController],
})
export class UserModule {}

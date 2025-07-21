import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from 'src/instructor/instructor.model';
import { User, UserSchema } from 'src/user/user.model';
import { Course, CourseSchema } from 'src/course/course.model';
import { STRIPE } from 'src/payment/payment.module';
import Stripe from 'stripe';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: STRIPE,
      useFactory: () => {
        return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2022-11-15',
        });
      },
    },
  ],
})
export class AdminModule {}

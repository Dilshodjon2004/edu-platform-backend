import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoDBConfig } from './config/mongo.config';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { InstructorModule } from './instructor/instructor.module';
import { FileModule } from './file/file.module';
import { SectionModule } from './section/section.module';
import { LessonModule } from './lesson/lesson.module';
import { AdminModule } from './admin/admin.module';
import { BooksModule } from './books/books.module';
import { PaymentModule } from './payment/payment.module';
import { CustomerModule } from './customer/customer.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoDBConfig,
    }),
    AuthModule,
    CourseModule,
    UserModule,
    MailModule,
    InstructorModule,
    FileModule,
    SectionModule,
    LessonModule,
    AdminModule,
    BooksModule,
    PaymentModule,
    CustomerModule,
    ReviewModule,
  ],
  providers: [],
})
export class AppModule {}

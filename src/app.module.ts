import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoDBConfig } from './config/mongo.config';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

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
  ],
})
export class AppModule {}

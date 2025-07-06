import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Instructor, InstructorSchema } from 'src/instructor/instructor.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Instructor.name, schema: InstructorSchema }])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

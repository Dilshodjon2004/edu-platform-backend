import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.model';
import { Instructor, InstructorSchema } from './instructor.model';
import { Course, CourseSchema } from 'src/course/course.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
})
export class InstructorModule {}

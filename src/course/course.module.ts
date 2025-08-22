import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.model';
import { Course, CourseSchema } from './course.model';
import { Instructor, InstructorSchema } from 'src/instructor/instructor.model';
import { Review, ReviewSchema } from 'src/review/review.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}

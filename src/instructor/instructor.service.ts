import { BadRequestException, Injectable } from '@nestjs/common';
import { InstructorApplyDto } from './dto/instructor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { Model } from 'mongoose';
import { Instructor, InstructorDocument } from './instructor.model';
import { Course, CourseDocument } from 'src/course/course.model';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}
  async applyAsInstructor(dto: InstructorApplyDto) {
    const { email, firstName, lastName, socialMedia } = dto;
    let user: UserDocument | null;
    const existUser = await this.userModel.findOne({ email });
    user = existUser;
    if (!existUser) {
      const newUser = await this.userModel.create({ ...dto, fullName: `${firstName} ${lastName}` });
      user = newUser;
    }
    const data = { socialMedia, author: user?._id };
    const existInstructor = await this.instructorModel.findOne({ author: user?._id });
    if (existInstructor)
      throw new BadRequestException('Instructor with this email already exists in our system.');

    await this.instructorModel.create(data);
    return 'success';
  }

  async getAllCourses(author: string) {
    return await this.courseModel.find({ author });
  }

  async getDetailedCourse(slug: string) {
    return await this.courseModel.findOne({ slug });
  }

  async getInstructors(language: string, limit: string) {
    const instructors = await this.instructorModel
      .find({ language, approved: true })
      .populate('author')
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .exec();

    return instructors.map(instructor => this.getSpecificFieldInstructor(instructor));
  }

  getSpecificFieldInstructor(instructor: InstructorDocument) {
    return {
      avatar: instructor.author.avatar,
      fullName: instructor.author.fullName,
    };
  }
}

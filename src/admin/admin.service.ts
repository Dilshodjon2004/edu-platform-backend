import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from 'src/course/course.model';
import { Instructor, InstructorDocument } from 'src/instructor/instructor.model';
import { User, UserDocument } from 'src/user/user.model';
import Stripe from 'stripe';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminService {
  private transporter;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @Inject('STRIPE') private readonly stripeClient: Stripe,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async getAllInstructors() {
    const instructors = await this.instructorModel.find().populate('author').exec();

    return instructors.map(instructor => this.getSpecificField(instructor));
  }

  async approveInstructor(instructorId: string) {
    const instructor = await this.instructorModel.findByIdAndUpdate(
      instructorId,
      { $set: { approved: true } },
      { new: true },
    );

    const user = await this.userModel.findById(instructor?.author);

    const account = await this.stripeClient.accounts.create({
      type: 'express',
      country: 'US',
      email: user?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const accountLinks = await this.stripeClient.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000',
      return_url: 'http://localhost:3000',
      type: 'account_onboarding',
    });

    await this.userModel.findByIdAndUpdate(
      instructor?.author,
      { $set: { role: 'INSTRUCTOR', instructorAccountId: account.id } },
      { new: true },
    );

    const emailData = {
      to: user?.email,
      subject: 'Successfully approved',
      from: 'no-reply@sammi.ac',
      html: `
        <p>Hi dear ${user?.fullName}, you approved to our platform like Instructor, follow the bellow steps.</p>
				<a href="${accountLinks.url}">Full finish your instructor account</a>
			`,
    };

    await this.transporter.sendMail(emailData);

    return 'success';
  }

  async deleteInstructor(instructorId: string) {
    const instructor = await this.instructorModel.findByIdAndUpdate(
      instructorId,
      { $set: { approved: false } },
      { new: true },
    );

    await this.userModel.findByIdAndUpdate(
      instructor?.author,
      { $set: { role: 'USER' } },
      { new: true },
    );

    return 'success';
  }

  async getAllUsers(limit: number) {
    const users = await this.userModel.find().limit(limit).sort({ createdAt: -1 }).exec();

    return users.map(user => this.getUserSpecificField(user));
  }

  async searchUsers(email: string, limit: number) {
    let users: UserDocument[];
    if (email) {
      users = await this.userModel.find().exec();
    } else {
      users = await this.userModel.find().limit(limit).exec();
    }
    const searchedUsers = users.filter(
      user => user.email.toLowerCase().indexOf(email.toLowerCase()) !== -1,
    );

    return searchedUsers.map(user => this.getUserSpecificField(user));
  }

  async deleteCourse(courseId: string) {
    const courseAuthor = await this.courseModel.findById(courseId);
    await this.instructorModel.findOneAndUpdate(
      { author: courseAuthor?.author },
      { $pull: { courses: courseId } },
      { new: true },
    );
    await this.courseModel.findByIdAndDelete(courseId, { new: true });
    const courses = await this.courseModel.find().exec();
    return courses.map(course => this.getCourseSpecificField(course));
  }

  getSpecificField(instructor: InstructorDocument) {
    return {
      _id: instructor._id,
      approved: instructor.approved,
      socialMedia: instructor.socialMedia,
      author: {
        fullName: instructor.author.fullName,
        email: instructor.author.email,
        job: instructor.author.job,
      },
    };
  }

  getUserSpecificField(user: UserDocument) {
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
  getCourseSpecificField(course: CourseDocument) {
    return {
      title: course.title,
      previewImage: course.previewImage,
      price: course.price,
      isActive: course.isActive,
      language: course.language,
      _id: course._id,
    };
  }
}

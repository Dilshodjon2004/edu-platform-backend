/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as nodemailer from 'nodemailer';
import { Otp, OtpDocument } from './otp.model';
import { User, UserDocument } from 'src/user/user.model';
import { compare, genSalt, hash } from 'bcryptjs';
import { Books, BooksDocument } from 'src/books/books.model';
@Injectable()
export class MailService {
  private transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Books.name) private booksModel: Model<BooksDocument>,
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
  async sendOtpVerification(email: string, isUser: boolean) {
    if (!email) throw new ForbiddenException('email_is_required');

    if (isUser) {
      const existUser = await this.userModel.findOne({ email });
      if (!existUser) throw new UnauthorizedException('user_not_found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await genSalt(10);
    const hashedOtp = await hash(String(otp), salt);
    const emailData = {
      to: email,
      from: 'dilshodjongulomov53@gmail.com',
      subject: 'Verification email',
      html: `
        <h1>OTP Verification Code: ${otp}</h1>`,
    };
    await this.otpModel.create({ email, otp: hashedOtp, expiresAt: Date.now() + 3600000 });
    await this.transporter.sendMail(emailData);

    return 'success';
  }

  async verifyOtp(email: string, otpVerification: string) {
    if (!otpVerification) throw new BadRequestException('send_otp_verification');

    const userExistOtp = await this.otpModel.find({ email });
    const { expiresAt, otp } = userExistOtp.slice(-1)[0];

    if (expiresAt < new Date()) {
      await this.otpModel.deleteMany({ email });
      throw new BadRequestException('expired_code');
    }

    const validOtp = await compare(otpVerification, otp);
    if (!validOtp) throw new BadRequestException('otp_is_incorrect');

    await this.otpModel.deleteMany({ email });
    return 'success';
  }

  async receiveBooks(bookId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    const book = await this.booksModel.findById(bookId);

    const emailData = {
      to: user?.email,
      subject: 'Ordered Book',
      from: 'dilshodjongulomov53@gmail.com',
      html: `
        <a href="${book?.pdf}">Your ordered book - ${book?.title}</a>`,
    };

    await this.transporter.sendMail(emailData);

    return 'success';
  }
}

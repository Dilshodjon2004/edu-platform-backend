/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as nodemailer from 'nodemailer';
import { Otp, OtpDocument } from './otp.model';
import { User, UserDocument } from 'src/user/user.model';
import { compare, genSalt, hash } from 'bcryptjs';
@Injectable()
export class MailService {
  private transporter;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
  async sendOtpVerification(email: string) {
    if (!email) throw new ForbiddenException('Email is required');

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
    if (!otpVerification) throw new BadRequestException('Please provide OTP Verification Code!');

    const userExistOtp = await this.otpModel.find({ email });
    const { expiresAt, otp } = userExistOtp.slice(-1)[0];

    if (expiresAt < new Date()) {
      await this.otpModel.deleteMany({ email });
      throw new BadRequestException('Expired OTP code, please try again!');
    }

    const validOtp = await compare(otpVerification, otp);
    if (!validOtp) throw new BadRequestException('Invalid OTP code, please try again!');

    await this.otpModel.deleteMany({ email });
    return 'success';
  }
}

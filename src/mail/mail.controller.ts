import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @HttpCode(200)
  @Post('send-otp')
  async sendOtp(@Body() dto: { email: string; isUser: boolean }): Promise<any> {
    return await this.mailService.sendOtpVerification(dto.email, dto.isUser);
  }

  @HttpCode(200)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: { email: string; otpVerification: string }) {
    return this.mailService.verifyOtp(dto.email, dto.otpVerification);
  }

  @HttpCode(200)
  @Post('books/:bookId')
  @Auth('USER')
  receiveBooks(@Param('bookId') bookId: string, @User('_id') _id: string) {
    return this.mailService.receiveBooks(bookId, _id);
  }
}

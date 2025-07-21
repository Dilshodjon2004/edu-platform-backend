import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaymentBooksDto } from './dto/payment-books.dto';
import { User } from 'src/user/decorators/user.decorator';
import { PaymentCourseDto } from './dto/payment-courses.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @HttpCode(200)
  @Post('books')
  @Auth('USER')
  paymentBooks(@Body() dto: PaymentBooksDto, @User('_id') _id: string) {
    return this.paymentService.paymentBooks(dto, _id);
  }

  @HttpCode(200)
  @Post('courses')
  @Auth('USER')
  paymentCourses(@Body() dto: PaymentCourseDto, @User('_id') _id: string) {
    return this.paymentService.paymentCourses(dto, _id);
  }
}

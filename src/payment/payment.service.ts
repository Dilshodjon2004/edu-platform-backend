/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentBooksDto } from './dto/payment-books.dto';
import { CustomerService } from 'src/customer/customer.service';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from 'src/course/course.model';
import { Model } from 'mongoose';
import { PaymentCourseDto } from './dto/payment-courses.dto';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('STRIPE') private readonly stripeClient: Stripe,
    private readonly customerService: CustomerService,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async paymentBooks(body: PaymentBooksDto, userID: string): Promise<string | null> {
    const customer = await this.customerService.getCustomer(userID);
    const card = await this.customerService.attachPaymentMethod(body.paymentMethod, userID);

    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: body.price * 100,
      currency: 'usd',
      payment_method: card.id,
      customer: String(customer.id),
    });

    return paymentIntent.client_secret;
  }

  async paymentCourses(body: PaymentCourseDto, userID: string): Promise<string | null> {
    const customer = await this.customerService.getCustomer(userID);
    const card = await this.customerService.attachPaymentMethod(body.paymentMethod, userID);
    const course = await this.courseModel.findById(body.courseId).populate('author');

    const feePrice = (30 / 100) * body.price;

    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: body.price * 100,
      currency: 'usd',
      payment_method: card.id,
      customer: customer.id,
      application_fee_amount: feePrice * 100,
      transfer_data: {
        destination: String(course?.author.instructorAccountId),
      },
    });

    return paymentIntent.client_secret;
  }

  async listProducts() {
    const products = await this.stripeClient.products.list({
      limit: 3,
      expand: ['data.default_price'],
    });
    return products.data;
  }

  async createSubscription(userID: string, body: PaymentBooksDto) {
    const customer = await this.customerService.getCustomer(userID);
    const card = await this.customerService.attachPaymentMethod(body.paymentMethod, userID);

    const subscription = await this.stripeClient.subscriptions.create({
      customer: customer.id,
      items: [{ price: String(body.price) }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      default_payment_method: card.id,
      trial_period_days: 14,
    });

    return subscription;
  }
}

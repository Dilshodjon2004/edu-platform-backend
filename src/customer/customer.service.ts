import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import Stripe from 'stripe';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('STRIPE') private readonly stripeClient: Stripe,
  ) {}

  async createCustomer(userID: string) {
    const user = await this.userModel.findById(userID);

    const customer = await this.stripeClient.customers.create({
      email: user?.email,
      metadata: { customerUID: userID },
    });

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user?._id,
      { $set: { customerId: customer.id } },
      { new: true },
    );

    updatedUser?.save();
    return customer;
  }

  async getCustomer(userID: string) {
    const user = await this.userModel.findById(userID);

    if (!user?.customerId) {
      return this.createCustomer(userID);
    }

    const customer = await this.stripeClient.customers.retrieve(user.customerId);
    return customer;
  }

  async attachPaymentMethod(paymentMethod: string, userID: string) {
    const customer = await this.getCustomer(userID);

    const attachedCard = await this.stripeClient.paymentMethods.attach(paymentMethod, {
      customer: customer.id,
    });

    return attachedCard;
  }

  async savedCustomerCard(customerId: string) {
    if (!customerId) throw new UnauthorizedException();

    const cards = await this.stripeClient.paymentMethods.list({
      customer: String(customerId),
      type: 'card',
      limit: 3,
    });

    return cards.data;
  }
}

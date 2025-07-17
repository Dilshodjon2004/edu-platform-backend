import { Controller, Get, HttpCode } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @HttpCode(200)
  @Get('saved-cards')
  @Auth('USER')
  savedCustomerCard(@User('customerId') customerId: string) {
    return this.customerService.savedCustomerCard(customerId);
  }
}

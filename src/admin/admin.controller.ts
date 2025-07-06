import { Controller, Get, HttpCode } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @HttpCode(200)
  @Get('all-instructors')
  @Auth('ADMIN')
  async getAllInstructors() {
    return this.adminService.getAllInstructors();
  }
}

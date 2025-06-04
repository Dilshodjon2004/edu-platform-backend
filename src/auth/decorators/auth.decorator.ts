import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleUser } from 'src/user/user.interface';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { OnlyInstructorGuard } from '../guards/instructor.guard';

export const Auth = (role: RoleUser = 'USER') => {
  if (role === 'ADMIN') {
    return applyDecorators(UseGuards(JwtAuthGuard, OnlyAdminGuard));
  } else if (role === 'INSTRUCTOR') {
    return applyDecorators(UseGuards(JwtAuthGuard, OnlyInstructorGuard));
  } else {
    return applyDecorators(UseGuards(JwtAuthGuard));
  }
};

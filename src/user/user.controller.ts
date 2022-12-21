import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtAccessTokenGuard } from 'src/auth/guard';

@UseGuards(JwtAccessTokenGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User): User {
    return user;
  }
}

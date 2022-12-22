import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtAccessTokenGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@UseGuards(JwtAccessTokenGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser('id') id: string): Promise<Partial<User>> {
    return this.userService.getUserById(id);
  }
}

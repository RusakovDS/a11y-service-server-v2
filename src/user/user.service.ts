import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User does not exist');
    }

    return user;
  }
}

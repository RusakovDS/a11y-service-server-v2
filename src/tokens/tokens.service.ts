import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens } from './types';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  generateTokens(userId: string, email: string): Tokens {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(userId, refreshToken): Promise<void> {
    const refreshTokenHash = await argon2.hash(refreshToken);
    const token = await this.prisma.token.findUnique({
      where: {
        userId,
      },
    });

    if (token) {
      await this.prisma.token.update({
        where: {
          userId,
        },
        data: {
          refreshTokenHash,
        },
      });
    } else {
      await this.prisma.token.create({
        data: {
          userId,
          refreshTokenHash,
        },
      });
    }
  }
}

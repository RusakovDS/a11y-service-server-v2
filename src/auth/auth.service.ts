import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { TokensService } from 'src/tokens/tokens.service';
import { JwtPayloadWithRefreshToken, Tokens } from 'src/tokens/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private tokensService: TokensService,
  ) {}

  async signup(authDto: AuthDto): Promise<Tokens> {
    const { email, password, firstName, lastName } = authDto;

    const hash = await this.hashData(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          hash,
          firstName,
          lastName,
        },
      });

      const tokens = this.tokensService.generateTokens(user.id, user.email);
      await this.tokensService.saveRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Email is already exist.');
      }
    }
  }

  async signin(authDto: AuthDto): Promise<Tokens> {
    const { email, password } = authDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const pwMatches = await this.verifyData(user.hash, password);

    if (!pwMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = this.tokensService.generateTokens(user.id, user.email);
    await this.tokensService.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout() {
    return 'logout';
  }

  async refreshTokens(userWithRefreshToken: JwtPayloadWithRefreshToken) {
    const { sub: userId, email, refresh_token } = userWithRefreshToken;
    const token = await this.prisma.token.findUnique({
      where: {
        userId,
      },
    });
    if (!token || !token.refreshTokenHash) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await this.verifyData(
      token.refreshTokenHash,
      refresh_token,
    );

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = this.tokensService.generateTokens(userId, email);
    await this.tokensService.saveRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  // TODO: make as utils separately
  async hashData(data: string): Promise<string> {
    return await argon2.hash(data);
  }

  async verifyData(hash: string, data: string): Promise<boolean> {
    return await argon2.verify(hash, data);
  }
}

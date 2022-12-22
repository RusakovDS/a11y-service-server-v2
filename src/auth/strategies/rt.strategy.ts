import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload, RefreshTokenPayload } from 'src/tokens/types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService, private prismaServise: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          if (req.cookies && 'refresh_token' in req.cookies) {
            return req.cookies.refresh_token;
          }
          return null;
        },
      ]),
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshTokenPayload {
    const refresh_token = req?.cookies?.refresh_token;
    if (!refresh_token) {
      throw new BadRequestException('Token was malformed');
    }

    return {
      id: payload.sub,
      email: payload.email,
      refresh_token,
    };
  }
}

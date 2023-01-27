import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { JwtRefreshTokenGuard } from './guard';
import { GetRefreshToken, GetUser } from './decorator';
import { RefreshTokenPayload, Tokens } from 'src/tokens/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.signup(authDto);
    res.cookie('refresh_token', tokens.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: true
    });
    return {
      user,
      token: tokens.accessToken
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.signin(authDto);
    res.cookie('refresh_token', tokens.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: true
    });
    return {
      user,
      token: tokens.accessToken
    };
  }

  @Post('logout')
  async logout(
    @GetRefreshToken() refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    res.clearCookie('refresh_token');
    return this.authService.logout(refreshToken);
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @GetUser() userWithRefreshToken: RefreshTokenPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authTokens: Tokens = await this.authService.refreshTokens(
      userWithRefreshToken,
    );
    res.cookie('refresh_token', authTokens.refreshToken, {
      httpOnly: true,
    });
    return {
      token: authTokens.accessToken
    };
  }
}

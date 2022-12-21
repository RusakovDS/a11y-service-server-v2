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
import { GetUser } from './decorator';
import { JwtPayloadWithRefreshToken, Tokens } from 'src/tokens/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const authToken = await this.authService.signup(authDto);
    res.cookie('access_token', authToken.accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    });
    res.cookie('refresh_token', authToken.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
    return;
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() authDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const authTokens: Tokens = await this.authService.signin(authDto);
    res.cookie('access_token', authTokens.accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    });
    res.cookie('refresh_token', authTokens.refreshToken, {
      maxAge: 1000 * 15,
      // maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
    return;
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @GetUser() userWithRefreshToken: JwtPayloadWithRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authTokens: Tokens = await this.authService.refreshTokens(
      userWithRefreshToken,
    );
    res.cookie('access_token', authTokens.accessToken, {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
    });
    res.cookie('refresh_token', authTokens.refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
    return;
  }
}

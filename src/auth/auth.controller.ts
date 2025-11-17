import { Controller, Get, Post, Body, Req, UseGuards, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { AUTH_MESSAGES } from 'src/common/constants/messages';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // Authenticate user using email/password (manual login)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.authService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!user) throw new BadRequestException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    return this.authService.login(user);
  }

  // Logout (JWT-protected)
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    return this.authService.logout(token);
  }

  // Refresh token (JWT-protected)
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Body() tokenDto: TokenDto): Promise<{ access_token: string }> {
    return this.authService.refreshToken(tokenDto.token);
  }

  // Google OAuth redirect
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<{ message: string }> {
    return { message: AUTH_MESSAGES.GOOGLE_REDIRECT };
  }

  // Google OAuth callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request): Promise<{ access_token: string } | { error: string }> {
    const profile: any = (req as any).user;
    const email = profile?.email;
    const displayName =
      profile?.displayName || profile?.name?.givenName || 'Google User';

    if (!email) {
      return { error: AUTH_MESSAGES.EMAIL_NOT_PROVIDED };
    }

    return this.authService.validateGoogleUser(email, displayName);
  }
}

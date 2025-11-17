import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions, StrategyOptionsWithRequest } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string, // cast to string
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    // Check if token exists and is active
    const userToken = await this.prisma['userlogins'].findFirst({
      where: {
        user_id: payload.sub,
        token: token,
        status: 'active',
      },
    });

    if (!userToken) {
      throw new UnauthorizedException('Invalid or inactive token');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user; // attaches to req.user
  }
}

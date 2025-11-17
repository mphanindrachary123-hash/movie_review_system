import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { users } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AUTH_MESSAGES } from 'src/common/constants/messages';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

  // Validate credentials (email/password login)
  async validateCredentials(
    email: string,
    password: string
  ): Promise<Pick<users, 'id' | 'username' | 'email' | 'role' | 'status'> | null> {
    const user = await this.prisma['users'].findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        password: true,
      },
    });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      if (user.status !== 'active') {
        throw new UnauthorizedException('Account is suspended');
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  //  JWT login
  async login(user: {
    id: number;
    username: string;
    email: string;
    role: string | null;
    status: string | null;
  }): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    await this.cleanupExpiredTokens(user.id);

    await this.prisma['userlogins'].create({
      data: {
        user_id: user.id,
        token,
        status: 'active',
        expiration_date: new Date(Date.now() + 3600 * 1000),
      },
    });

    return { access_token: token };
  }

  //  Logout
  async logout(token: string): Promise<{ message: string }> {
    const userLogin = await this.prisma['userlogins'].findFirst({
      where: { token },
    });

    if (userLogin) {
      await this.prisma['userlogins'].updateMany({
        where: { token },
        data: { status: 'suspended' },
      });
    }

    return { message: AUTH_MESSAGES.LOG_OUT };
  }

  async validateGoogleUser(email: string, username: string): Promise<{ access_token: string }> {
    let user = await this.prisma['users'].findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      user = await this.prisma['users'].create({
        data: {
          email,
          username,
          role: 'user',
          status: 'active',
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
        },
      });
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(AUTH_MESSAGES.SUSPENDED_ACCOUNT);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    await this.cleanupExpiredTokens(user.id);

    await this.prisma['userlogins'].create({
      data: {
        user_id: user.id,
        token,
        status: 'active',
        expiration_date: new Date(Date.now() + 3600 * 1000),
      },
    });

    return { access_token: token };
  }

  // JWT token validation
  async validateJwtPayload(
    payload: Record<string, any>
  ): Promise<Pick<users, 'id' | 'username' | 'email' | 'role' | 'status'> | null> {
    const user = await this.prisma['users'].findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return user;
  }

  async generateToken(userId: number, role: string): Promise<string> {
    const payload = { sub: userId, role };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  async cleanupExpiredTokens(userId: number): Promise<void> {
    await this.prisma['userlogins'].updateMany({
      where: {
        user_id: userId,
        OR: [{ status: 'suspended' }, { expiration_date: { lt: new Date() } }],
      },
      data: { status: 'suspended' },
    });
  }

  async validateToken(token: string, userId: number): Promise<boolean> {
    const userToken = await this.prisma['userlogins'].findFirst({
      where: {
        user_id: userId,
        token: token,
        status: 'active',
        expiration_date: {
          gt: new Date(),
        },
      },
    });

    return !!userToken;
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    const userLogin = await this.prisma['userlogins'].findFirst({
      where: {
        token,
        status: 'active',
        expiration_date: {
          gt: new Date(),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!userLogin || userLogin.users.status !== 'active') {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const payload = {
      sub: userLogin.users.id,
      email: userLogin.users.email,
      role: userLogin.users.role,
    };
    const newToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    await this.prisma['userlogins'].update({
      where: { id: userLogin.id },
      data: {
        token: newToken,
        expiration_date: new Date(Date.now() + 3600 * 1000),
      },
    });

    return { access_token: newToken };
  }
}

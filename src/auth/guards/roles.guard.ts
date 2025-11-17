import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    // Extract token from request for additional validation
    const authHeader = request.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    // Validate token is still active and not expired
    const userToken = await this.prisma['userlogins'].findFirst({
      where: {
        user_id: user.userId,
        token: token,
        status: 'active',
        expiration_date: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!userToken) {
      throw new UnauthorizedException('Token expired or invalidated');
    }

    // Check if user has required role
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Access denied: insufficient role. Required: ${requiredRoles.join(', ')}, Current: ${user.role}`);
    }

    return true;
  }
}

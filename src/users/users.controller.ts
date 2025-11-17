import { Controller, Get, UseGuards, Param, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { users } from '@prisma/client';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<Omit<users, 'password'>> {
    const loggedInUser = req.user;

    if (loggedInUser.role === 'admin') {
      return this.usersService.getUserById(id);
    }

    if (loggedInUser.id === id) {
      return this.usersService.getUserById(id);
    }

    throw new ForbiddenException('You are not allowed to access this user');
  }

}

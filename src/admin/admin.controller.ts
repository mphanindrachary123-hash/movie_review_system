import { Controller, Post, Put, Delete, Get, Body, Param, Query, ParseIntPipe, UseGuards, HttpStatus, HttpCode, ConflictException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOnly } from '../auth/roles.decorator';
import { GetAllUsersQueryDto } from 'src/users/dto/get-all-users.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { users } from '@prisma/client';
import { AUTH_MESSAGES } from 'src/common/constants/messages';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@AdminOnly()
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Get('all')
  getAllUsers(@Query() query: GetAllUsersQueryDto): Promise<Omit<users, 'password'>[]> {
    return this.usersService.getAllUsers(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto): Promise<Omit<users, 'password'>> {
    try {
      const user = await this.usersService.createUser(dto);
      return user
    }
    catch (error) {
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        const field = error.meta?.target || 'field';
        throw new ConflictException(
          AUTH_MESSAGES.CONFLICT_A + ` ${field} ` + AUTH_MESSAGES.CONFLICT_B
        );
      }
      throw error;
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<users, 'password'>> {
    const updatedUser = await this.usersService.updateUser(id, dto);

    return updatedUser;
  }

  @Delete(':id')
  async suspendUser(@Param('id', ParseIntPipe) id: number): Promise<Omit<users, 'password'>> {
    const suspended = await this.usersService.suspendUser(id);
    return suspended;
  }
}

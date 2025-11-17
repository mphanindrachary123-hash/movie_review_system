import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { Prisma, users, $Enums } from '@prisma/client';
import { GetAllUsersQueryDto } from './dto/get-all-users.dto';
import * as bcrypt from 'bcrypt';
import { PAGE_VALIDATION } from 'src/common/constants/messages';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // Create user
  async createUser(dto: CreateUserDto): Promise<Omit<users, 'password'>> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma['users'].create({
      data: {
        username: dto.username,
        email: dto.email,
        role: dto.role,
        status: dto.status,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      }
    });
  }

  // Get user by ID
  async getUserById(id: number): Promise<Omit<users, 'password'>> {
    const user = await this.prisma['users'].findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    }
    );
    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return user;
  }

  // Get all users with pagination & filters
  async getAllUsers(query: GetAllUsersQueryDto): Promise<Omit<users, 'password'>[]> {
    // Validate 'page'
    if (query.page !== undefined) {
      const parsedPage = Number(query.page);
      if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
        throw new BadRequestException(PAGE_VALIDATION.PAGE_NOT_POSITIVE);
      }
    }

    // Validate 'size'
    if (query.size !== undefined) {
      const parsedSize = Number(query.size);
      if (!Number.isInteger(parsedSize) || parsedSize <= 0) {
        throw new BadRequestException(PAGE_VALIDATION.SIZE_NOT_POSITIVE);
      }
    }
    const page = Number(query?.page) > 0 ? Number(query.page) : 1;
    const size = Number(query?.size) > 0 ? Number(query.size) : 10;
    if (page > 10000) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_PAGE);
    }
    if (size > 100) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_SIZE);
    }

    const skip = (page - 1) * size;
    const take = size;

    const where: Prisma.usersWhereInput = {};
    if (query?.role) where.role = query.role as $Enums.users_role;
    if (query?.status) where.status = query.status as $Enums.users_status;
    if (query?.search) {
      const search = String(query.search);
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }

    let orderBy: Prisma.usersOrderByWithRelationInput = { created_at: 'desc' };
    if (query?.sort) {
      const [fieldRaw, dirRaw] = String(query.sort).split(',');
      const field = (fieldRaw || '').trim();
      const direction = (dirRaw || 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc';
      const allowedSortFields = new Set(['created_at', 'updated_at', 'id']);
      if (allowedSortFields.has(field)) {
        orderBy = { [field]: direction };
      }
    }

    return this.prisma['users'].findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // Update user role/status
  async updateUser(id: number, dto: UpdateUserDto): Promise<Omit<users, 'password'>> {
    const existing = await this.prisma.users.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const data: Prisma.usersUpdateInput = {};
    if (dto.role) data.role = dto.role as $Enums.users_role;
    if (dto.status) data.status = dto.status as $Enums.users_status;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma['users'].update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      }
    });


    return updated;
  }

  // Suspend user (soft delete)
  async suspendUser(id: number): Promise<Omit<users, 'password'>> {
    const existing = await this.prisma['users'].findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.prisma['users'].update({
      where: { id },
      data: { status: 'suspended' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
        password: false
      },
    });

    return updated;
  }

}

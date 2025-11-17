import { Controller, Get, Post, Delete, Put, Param, Body, Query, UseGuards, ParseIntPipe, Req, } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieCreateDto } from './dto/movie-create.dto';
import { MovieFilterDto } from './dto/movie-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOnly } from '../auth/roles.decorator';
import type { Request } from 'express';
import { MovieAvailabilityDto } from './dto/movie-availability.dto';
import { movies, Prisma } from '@prisma/client';
import { MOVIE_MESSAGES } from 'src/common/constants/messages';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  // Create a movie (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Post()
  async createMovie(@Body() dto: MovieCreateDto, @Req() req: Request): Promise<movies> {
    const user = req.user as { id: number; email: string; role: string };
    return this.moviesService.createMovie(dto, user.id);
  }

  // Get all movies (for both Admin and Users)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMovies(@Query() filter: MovieFilterDto, @Req() req: Request): Promise<{ page: number; size: number; total: number; movies: Prisma.moviesGetPayload<{ select?: any }>[] }> {
    const user = req.user as { id: number; role: string };
    return this.moviesService.getAllMovies(filter, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('available')
  async getAvailableMovies(@Query() query: MovieAvailabilityDto): Promise<{ total: number; movies: movies[] }> {
    return this.moviesService.getAvailableMovies(query);
  }

  //Get movie by ID (for both Admin and Users)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMovieById(@Param('id', ParseIntPipe) id: number, @Req() req: Request): Promise<movies> {
    const user = req.user as { id: number; role: string };
    return this.moviesService.getMovieById(id, user);
  }

  // Delete movie (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Delete(':id')
  async deleteMovie(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.moviesService.deleteMovie(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Put(':id/approve')
  async approveMovie(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.moviesService.approveMovie(id);
    return { message: MOVIE_MESSAGES.APPROVING_MOVIE };
  }
}

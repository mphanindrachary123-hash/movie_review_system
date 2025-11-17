import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovieCreateDto } from './dto/movie-create.dto';
import { MovieFilterDto } from './dto/movie-filter.dto';
import { movies, Prisma } from '@prisma/client';
import { MovieAvailabilityDto } from './dto/movie-availability.dto';
import { MOVIE_MESSAGES, PAGE_VALIDATION } from 'src/common/constants/messages';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) { }

  // Create a new movie (Admin)
  async createMovie(dto: MovieCreateDto, createdBy: number): Promise<movies> {
    try {
      return await this.prisma.movies.create({
        data: {
          ...dto,
          created_by: createdBy,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(MOVIE_MESSAGES.MOVIE_ALREADY_EXISTS);
        }
      }
      throw error;
    }
  }

  //  Get all movies with filters and pagination
  async getAllMovies(filter: MovieFilterDto, user?: { id: number; role: string }): Promise<{ page: number; size: number; total: number; movies: Prisma.moviesGetPayload<{ select?: any }>[] }> {
    const {
      title,
      genre,
      language,
      director,
      cast,
      ratingFrom,
      page = '1',
      size = '10',
      sort,
      fields,
    } = filter;

    // Validate pagination values
    const parsedPage = Number(page);
    const parsedSize = Number(size);
    if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
      throw new BadRequestException(PAGE_VALIDATION.PAGE_NOT_POSITIVE);
    }
    if (!Number.isInteger(parsedSize) || parsedSize <= 0) {
      throw new BadRequestException(PAGE_VALIDATION.SIZE_NOT_POSITIVE);
    }

    if (parsedPage > 10000) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_PAGE);
    }
    if (parsedSize > 100) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_SIZE);
    }

    const where: Prisma.moviesWhereInput = {};

    if (!user || user.role !== 'admin') {
      where.approved = true;
    }

    if (title) where.title = { contains: title };
    if (genre) where.genre = { contains: genre };
    if (language) where.language = { equals: language };
    if (director) where.director = { contains: director };
    if (cast) where.cast = { contains: cast };
    if (ratingFrom) where.rating = { gte: Number(ratingFrom) };

    const [sortField, sortOrder] = sort?.split(',') || ['rating', 'desc'];

    const select = fields
      ? Object.fromEntries(fields.split(',').map((f) => [f.trim(), true]))
      : undefined;

    const movies = await this.prisma.movies.findMany({
      where,
      select,
      skip: (Number(page) - 1) * Number(size),
      take: Number(size),
      orderBy: { [sortField]: sortOrder === 'desc' ? 'desc' : 'asc' },
    });

    const total = await this.prisma.movies.count({ where });

    return { page: Number(page), size: Number(size), total, movies };
  }

  //  Get movie by ID
  async getMovieById(id: number, user?: { id: number; role: string }): Promise<movies> {
    const movie = await this.prisma.movies.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, username: true, email: true } },
        reviews: true,
        movie_availability: true,
      },
    });

    if (!movie) throw new NotFoundException(MOVIE_MESSAGES.NOT_FOUND);

    if (!movie.approved && (!user || user.role !== 'admin')) {
      throw new ForbiddenException(MOVIE_MESSAGES.NOT_APPROVED);
    }
    return movie;
  }

  //  Delete movie (Admin only)
  async deleteMovie(id: number): Promise<{ message: string }> {
    const movie = await this.prisma.movies.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException(MOVIE_MESSAGES.NOT_FOUND);

    await this.prisma.movies.delete({ where: { id } });
    return { message: MOVIE_MESSAGES.DELETED };
  }


  async approveMovie(movieId: number): Promise<void> {
    const movie = await this.prisma.movies.findUnique({
      where: { id: movieId },
    });
    if (!movie) throw new NotFoundException(MOVIE_MESSAGES.NOT_FOUND);

    if (movie.approved === true) {
      throw new ConflictException(MOVIE_MESSAGES.ALREADY_APPROVED);
    }

    await this.prisma.movies.update({
      where: { id: movieId },
      data: { approved: true },
    });
  }

  async getAvailableMovies(filter: MovieAvailabilityDto): Promise<{ total: number; movies: movies[] }> {
    const {
      region,
      platform,
      availability_type,
      page = '1',
      size = '10',
      sort = 'release_year,desc',
    } = filter;


    const [sortField, sortOrder] = String(sort || 'release_year,desc').split(',');

    // Validate pagination values
    const parsedPage = Number(page);
    const parsedSize = Number(size);
    if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
      throw new BadRequestException(PAGE_VALIDATION.PAGE_NOT_POSITIVE);
    }
    if (!Number.isInteger(parsedSize) || parsedSize <= 0) {
      throw new BadRequestException(PAGE_VALIDATION.SIZE_NOT_POSITIVE);
    }
    // base condition: only approved movies and require at least one availability record
    const where: Prisma.moviesWhereInput = {
      approved: true,
    };

    const availabilityConditions: Prisma.movie_availabilityWhereInput = {};

    if (region) {
      availabilityConditions.regions = { is: { code: String(region).toUpperCase() } };
    }

    if (platform) {

      availabilityConditions.platforms = { is: { name: { contains: String(platform) } } };
    }

    if (availability_type) {
      availabilityConditions.availability_type = String(availability_type);
    }

    if (Object.keys(availabilityConditions).length > 0) {
      where.movie_availability = { some: availabilityConditions };
    }

    const movies = await this.prisma.movies.findMany({
      where,
      skip: (Number(page) - 1) * Number(size),
      take: Number(size),
      orderBy: { [sortField]: sortOrder === 'desc' ? 'desc' : 'asc' },
    });

    const total = await this.prisma.movies.count({ where });

    return { total, movies };
  }

}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddWatchlistDto, } from './dto/add-watchlist.dto';
import { GetWatchlistDto } from './dto/get-watchlist.dto';
import { watchlist, Prisma, watch_status } from '@prisma/client';
import { MOVIE_MESSAGES, PAGE_VALIDATION, WATCHLIST_MESSAGES } from 'src/common/constants/messages';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) { }

  //  Add a movie to watchlist
  async addToWatchlist(
    userId: number,
    movieId: number,
    dto: AddWatchlistDto,
    regionCode?: string,
  ): Promise<{ message: string; watchlistItem: watchlist }> {
    const movie = await this.prisma.movies.findUnique({
      where: { id: movieId },
      include: {
        movie_availability: {
          include: {
            regions: true,
          },
        },
      },
    });

    if (!movie) throw new NotFoundException(MOVIE_MESSAGES.NOT_FOUND);

    // region validation
    const available = movie.movie_availability.some(
      (av) => av.regions?.code === regionCode,
    );

    if (!available)
      throw new BadRequestException(
        MOVIE_MESSAGES.NOT_AVAILABLE + ` (${regionCode})`,
      );

    const existing = await this.prisma.watchlist.findFirst({
      where: {
        user_id: userId,
        movie_id: movieId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        WATCHLIST_MESSAGES.IN_WATCHLIST + ` (${regionCode})`,
      );
    }

    const watchlistItem = await this.prisma.watchlist.create({
      data: {
        user_id: userId,
        movie_id: movieId,
        status: dto.status ?? watch_status.TO_WATCH,
      },
    });

    return { message: WATCHLIST_MESSAGES.ADDED, watchlistItem };
  }

  //Update watchlist status (mark as WATCHED)
  async updateWatchStatus(
    userId: number,
    movieId: number,
    status: watch_status,
  ): Promise<{ message: string; updated: watchlist }> {
    const item = await this.prisma.watchlist.findUnique({
      where: {
        user_id_movie_id: { user_id: userId, movie_id: movieId },
      },
    });

    if (!item) throw new NotFoundException('Watchlist entry not found');

    const updated = await this.prisma.watchlist.update({
      where: {
        user_id_movie_id: { user_id: userId, movie_id: movieId },
      },
      data: { status },
    });

    return { message: 'Watchlist status updated', updated };
  }



  // Get user’s watchlist
  async getUserWatchlist(userId: number, query: GetWatchlistDto): Promise<{ total: number; items: watchlist[] }> {
    const { status, page, size, sort } = query;
    const [sortField, sortOrder] = sort.split(',');

    if (page > 10000) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_PAGE);
    }
    if (size > 100) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_SIZE);
    }
    const where: Prisma.watchlistWhereInput = { user_id: userId };
    if (status) where.status = status;

    const total = await this.prisma.watchlist.count({ where });

    const items = await this.prisma.watchlist.findMany({
      where,
      skip: (page - 1) * size,
      take: size,
      orderBy: { [sortField]: sortOrder === 'desc' ? 'desc' : 'asc' },
      include: {
        movies: true,
      },
    });

    return { total, items };
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Prisma, reviews } from '@prisma/client';
import { GetReviewsQueryDto } from './dto/get-reviews.dto';
import { PAGE_VALIDATION, REVIEW_MESSAGES } from 'src/common/constants/messages';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async addReview(userId: number, body:CreateReviewDto): Promise<{ message: string; review: reviews }> {
    const { movie_id, rating, comment } = body;

    if (rating < 0 || rating > 10)
      throw new BadRequestException(REVIEW_MESSAGES.RATING);

    const existing = await this.prisma.reviews.findFirst({
      where: { movie_id, user_id: userId },
    });
    if (existing)
      throw new BadRequestException(REVIEW_MESSAGES.ALREADY_REVIEWED);

    const review = await this.prisma.reviews.create({
      data: { movie_id, user_id: userId, rating, comment },
    });

    await this.updateMovieAverageRating(movie_id);
    return { message: REVIEW_MESSAGES.REVIEW_CREATED, review };
  }

  private async updateMovieAverageRating(movie_id: number): Promise<void> {
    const reviews = await this.prisma.reviews.findMany({ where: { movie_id } });
    if (!reviews.length) return;
    const avg =
      reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) / reviews.length;

    await this.prisma.movies.update({
      where: { id: movie_id },
      data: { rating: avg },
    });
  }

  async getReviewsByMovie(movieId:number,query: GetReviewsQueryDto )  : Promise<{ total: number; reviews: reviews[] }> {
    const {page=1, size=10, sort='created_at,desc', ratingFrom, userId, sortBy } = query;
    const [sortField, sortDir] = sort.split(',');
    const pageValue = Number(page);
    const sizeValue = Number(size);
    if (pageValue > 10000) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_PAGE);
    }
    if (sizeValue > 100) {
      throw new BadRequestException(PAGE_VALIDATION.LARGE_SIZE);
    }
    const skip = (pageValue - 1) * sizeValue;
    const where: Prisma .reviewsWhereInput = { movie_id: movieId };
    if (ratingFrom) where.rating = { gte: ratingFrom };
    if (userId) where.user_id = userId;

    const orderBy: Prisma.reviewsOrderByWithRelationInput = {};
    orderBy[sortBy || sortField] = sortDir === 'desc' ? 'desc' : 'asc';

    const reviews = await this.prisma.reviews.findMany({
      where,
      skip,
      take: size,
      orderBy,
      include: {
        users: { select: { username: true, email: true } },
      },
    });

    const total = await this.prisma.reviews.count({ where });
    return { total, reviews };
  }
  async deleteReviewByAdmin(reviewId: number): Promise<{ message: string }> {
    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
    });
  
    if (!review) throw new NotFoundException (REVIEW_MESSAGES.NOT_FOUND);
  
    await this.prisma.reviews.delete({ where: { id: reviewId } });
    return { message: REVIEW_MESSAGES.DELETED };
  }
  
}

import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  Req,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminOnly } from 'src/auth/roles.decorator';
import { GetReviewsQueryDto } from './dto/get-reviews.dto';
import { reviews } from '@prisma/client';
import { REVIEW_MESSAGES } from 'src/common/constants/messages';

type AuthRequest = {
  user: { id: number; email?: string; role?: string };
};

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  async addReview(@Body() body: CreateReviewDto, @Req() req: AuthRequest): Promise<{ message: string; review: reviews }> {
    const userId = req.user.id;
    return this.reviewsService.addReview(userId, body);
  }

  @Get('by-movie/:id')
  async getReviewsByMovie(@Param('id', ParseIntPipe) movieId: number, @Query() query: GetReviewsQueryDto,): Promise<{ total: number; reviews: reviews[] }> {
    query.page = query.page ?? 1;
    query.size = query.size ?? 10;
    query.sort = query.sort ?? 'created_at,desc';

    return this.reviewsService.getReviewsByMovie(movieId, query);
  }

  @UseGuards(RolesGuard)
  @AdminOnly()
  @Delete(':review_id')
  async deleteReviewByAdmin(
    @Param('review_id') reviewId: string,
    @Req() req: AuthRequest,): Promise<{ message: string }> {
    await this.reviewsService.deleteReviewByAdmin(Number(reviewId));
    return { message: REVIEW_MESSAGES.DELETED };
  }

}

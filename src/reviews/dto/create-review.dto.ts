import { IsNumber,IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1, { message: 'movie_id must be a positive integer' })
    movie_id: number;

  @IsNumber()
  @Min(0, { message: 'rating cannot be less than 0' })
  @Max(10, { message: 'rating cannot be greater than 10' })
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

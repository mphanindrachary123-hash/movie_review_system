import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetReviewsQueryDto {

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  size?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsNumber()
  ratingFrom?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;
}

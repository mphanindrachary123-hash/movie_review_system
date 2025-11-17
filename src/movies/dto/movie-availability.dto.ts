import { IsString, IsOptional } from 'class-validator';
export class MovieAvailabilityDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  availability_type: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
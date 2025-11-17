import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUrl, IsBoolean } from 'class-validator';

export class MovieCreateDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsString()
  cast?: string;

  @IsOptional()
  @IsNumber()
  release_year?: number;

  @IsOptional()
  @IsUrl()
  poster_url?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}

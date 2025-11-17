import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { watch_status } from '@prisma/client';

export class GetWatchlistDto {
  @IsOptional()
  @IsEnum(watch_status, {
    message: 'Status must be TO_WATCH, WATCHING, or WATCHED',
  })
  status?: watch_status;


  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  size = 10;

  @IsOptional()
  @IsString()
  sort = 'created_at,desc';

  @IsOptional()
  @IsString()
  regionCode?: string;
}

import { IsArray, IsEnum, IsInt, IsOptional ,IsString} from 'class-validator';
import { Type } from 'class-transformer';
import { watch_status } from '@prisma/client';


export class AddWatchlistDto {
  @IsOptional()
  @IsEnum(watch_status, {
    message: 'Status must be TO_WATCH, WATCHING, or WATCHED',
  })
  status?: watch_status;
  
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  movie_ids?: number[];

  @IsOptional()
  @IsString()
  region_code?: string;
}

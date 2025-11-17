import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt.guard';
  import { WatchlistService } from './watchlist.service';
  import { AddWatchlistDto } from './dto/add-watchlist.dto';
  import { GetWatchlistDto } from './dto/get-watchlist.dto';
  import type { AuthRequest } from 'src/common/types/auth-request.type';
  import { watchlist } from '@prisma/client';


  @Controller('watchlist')
  @UseGuards(JwtAuthGuard)

    export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) {}
  
    @Post(':movie_id')
    async addToWatchlist(
      @Param('movie_id') movieId: number,
      @Body() dto: AddWatchlistDto,
      @Req() req:AuthRequest,
      @Query('region') regionCode?: string,
    ) : Promise<{ message: string; watchlistItem: watchlist }>{
      return this.watchlistService.addToWatchlist(req.user.id, Number(movieId), dto, regionCode);
    }
  
    @Get()
    async getWatchlist(@Req() req:AuthRequest, @Query() query: GetWatchlistDto): Promise<{ total: number; items: watchlist[] }>  {
      return this.watchlistService.getUserWatchlist(req.user.id, query);
    }
  }
  
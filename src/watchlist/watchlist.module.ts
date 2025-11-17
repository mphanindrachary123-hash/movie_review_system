import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  controllers: [WatchlistController],
  providers: [WatchlistService, PrismaService],
  exports: [WatchlistService],
})
export class WatchlistModule {}

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { MoviesModule } from './movies/movies.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { ReviewsModule } from './reviews/reviews.module';
import { Reflector } from '@nestjs/core';
import { RegionModule } from './regions/region.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './common/env_validator/env.validation';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, AdminModule, MoviesModule, ReviewsModule, RegionModule, WatchlistModule,UploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
  ],
  providers: [ RolesGuard, Reflector],
})
export class AppModule{}


import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOnly } from '../auth/roles.decorator';
import { regions } from '@prisma/client';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Post()
  async createRegion(@Body() dto: CreateRegionDto): Promise<{ message: string; region: regions }> {
    return this.regionService.createRegion(dto);
  }

  @Get(':id')
  async getRegionById(@Param('id') id: string): Promise<regions> {
    return this.regionService.getRegionById(Number(id));
  }
}

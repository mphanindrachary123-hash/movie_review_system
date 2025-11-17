import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { regions } from '@prisma/client';
import { REGION_MESSAGES } from 'src/common/constants/messages';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) { }

  async createRegion(dto: CreateRegionDto): Promise<{ message: string; region: regions }> {
    const existing = await this.prisma.regions.findFirst({
      where: {
        OR: [
          { name: dto.name },
          { code: dto.code },
        ],
      },
    });
    if (existing) throw new ConflictException(REGION_MESSAGES.UNIQUE_REGION);

    const region = await this.prisma.regions.create({
      data: { name: dto.name, code: dto.code },
    });

    return { message: REGION_MESSAGES.CREATED, region };
  }

  async getRegionById(id: number): Promise<regions> {
    const region = await this.prisma.regions.findUnique({ where: { id } });
    if (!region) throw new NotFoundException(REGION_MESSAGES.NOT_FOUND);
    return region;
  }
}

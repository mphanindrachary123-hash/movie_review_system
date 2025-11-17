import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { REGION_MESSAGES } from 'src/common/constants/messages';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: REGION_MESSAGES.REGION_CODE })
  code: string;
}

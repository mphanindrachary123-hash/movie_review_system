import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';
import { USER_MESSAGES } from 'src/common/constants/messages';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: USER_MESSAGES.INVALID_EMAIL })
  email?: string;

  @IsOptional()
  @IsString()
  password?:string;

  @IsOptional()
  @IsIn(['admin','user'],{message:USER_MESSAGES.INVALID_ROLE}) 
  role?: string;

  @IsOptional()
  @IsIn(['active','suspended'],{message:USER_MESSAGES.INVALID_STATUS})
  status?: string;
}

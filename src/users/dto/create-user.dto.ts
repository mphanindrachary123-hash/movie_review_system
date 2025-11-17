import { users_role, users_status } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { USER_MESSAGES } from 'src/common/constants/messages';

export class CreateUserDto {
  @IsNotEmpty({ message: USER_MESSAGES.USERNAME_REQ })
  @IsString()
  username: string;

  @IsEmail({}, { message: USER_MESSAGES.INVALID_EMAIL })
  email: string;

  @IsNotEmpty({ message: USER_MESSAGES.PASSWORD_REQUIRED })
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(users_role, { message: USER_MESSAGES.INVALID_ROLE })
  role: users_role;

  @IsOptional()
  @IsEnum(users_status, { message: USER_MESSAGES.INVALID_STATUS })
  status: users_status;
}

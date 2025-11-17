import { $Enums, users_role, users_status } from '@prisma/client';
import {IsOptional ,IsEnum, IsString, IsNumber, Matches} from 'class-validator'
import { USER_MESSAGES } from 'src/common/constants/messages';

export class GetAllUsersQueryDto {
    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    @IsNumber()
    size?: number;

    @IsOptional()
    @IsEnum(users_role, {message: USER_MESSAGES.INVALID_ROLE})
    role?: users_role;

    @IsOptional()
    @IsEnum(users_status,{message: USER_MESSAGES.INVALID_ROLE})
    status?: $Enums.users_status;

    
    @IsOptional()
    @IsString()
    search?: string;
  
    @IsOptional()
    @IsString()
    @Matches(/^(created_at|updated_at|id)(,\s*(asc|desc))?$/i, {
        message: USER_MESSAGES.SORT_INPUT
    })
    sort?: string;
}
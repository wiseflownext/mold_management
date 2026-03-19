import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty() @IsString() username: string;
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() @MinLength(6) password: string;
  @IsEnum(['admin', 'operator']) role: string;
  @IsOptional() @IsInt() workshopId?: number;
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(['admin', 'operator']) role?: string;
  @IsOptional() @IsInt() workshopId?: number;
}

export class ResetPasswordDto {
  @IsString() @MinLength(6) newPassword: string;
}

export class QueryUserDto {
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsInt() @Type(() => Number) page?: number = 1;
  @IsOptional() @IsInt() @Type(() => Number) pageSize?: number = 20;
}

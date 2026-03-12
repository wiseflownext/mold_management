import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaintenanceRecordDto {
  @IsInt() moldId: number;
  @IsEnum(['MAINTAIN', 'REPAIR']) type: string;
  @IsNotEmpty() @IsString() content: string;
  @IsNotEmpty() @IsString() recordDate: string;
}

export class QueryMaintenanceRecordDto {
  @IsOptional() @IsInt() @Type(() => Number) moldId?: number;
  @IsOptional() @IsInt() @Type(() => Number) operatorId?: number;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) pageSize?: number = 20;
}

import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsageRecordDto {
  @IsInt() moldId: number;
  @IsNotEmpty() @IsString() product: string;
  @IsInt() @Min(1) quantity: number;
  @IsEnum(['MORNING', 'AFTERNOON', 'NIGHT']) shift: string;
  @IsNotEmpty() @IsString() recordDate: string;
  @IsOptional() @IsString() note?: string;
}

export class QueryUsageRecordDto {
  @IsOptional() @IsInt() @Type(() => Number) moldId?: number;
  @IsOptional() @IsInt() @Type(() => Number) operatorId?: number;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) pageSize?: number = 20;
}

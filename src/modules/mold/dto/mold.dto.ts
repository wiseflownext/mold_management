import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @IsOptional() @IsString() customer?: string;
  @IsOptional() @IsString() model?: string;
  @IsNotEmpty({ message: '产品名称不能为空' }) @IsString() name: string;
  @IsOptional() @IsString() partNumber?: string;
}

export class CreateMoldDto {
  @IsNotEmpty() @IsString() moldNumber: string;
  @IsEnum(['COMPRESSION', 'EXTRUSION', 'CORNER']) type: string;
  @IsOptional() @IsInt() workshopId?: number;
  @IsOptional() @IsString() firstUseDate?: string;
  @IsInt() @Min(1) designLife: number;
  @IsInt() @Min(1) maintenanceCycle: number;
  @IsOptional() @IsInt() @Min(1) periodicMaintenanceDays?: number;
  @IsOptional() @IsInt() @Min(1) cavityCount?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateProductDto) products?: CreateProductDto[];
}

export class UpdateMoldDto {
  @IsOptional() @IsString() moldNumber?: string;
  @IsOptional() @IsEnum(['COMPRESSION', 'EXTRUSION', 'CORNER']) type?: string;
  @IsOptional() @IsInt() workshopId?: number;
  @IsOptional() @IsString() firstUseDate?: string;
  @IsOptional() @IsInt() @Min(1) designLife?: number;
  @IsOptional() @IsInt() @Min(1) maintenanceCycle?: number;
  @IsOptional() @IsInt() @Min(1) periodicMaintenanceDays?: number;
  @IsOptional() @IsInt() @Min(1) cavityCount?: number;
  @IsOptional() @IsEnum(['IN_USE', 'REPAIRING', 'STOPPED', 'SCRAPPED']) status?: string;
}

export class UpdateDesignLifeDto {
  @IsInt() @Min(1) newDesignLife: number;
  @IsNotEmpty() @IsString() reportUrl: string;
}

export class QueryMoldDto {
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsInt() @Type(() => Number) workshopId?: number;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) pageSize?: number = 20;
}

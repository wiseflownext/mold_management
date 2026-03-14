import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateReminderSettingDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsInt() @Min(1) remainingThreshold?: number;
  @IsOptional() @IsInt() @Min(1) @Max(100) warningPercent?: number;
  @IsOptional() @IsInt() @Min(1) @Max(100) overduePercent?: number;
  @IsOptional() @IsInt() @Min(1) @Max(30) periodicAdvanceDays?: number;
}

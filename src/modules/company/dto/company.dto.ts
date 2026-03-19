import { IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: '公司名称不能为空' })
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty({ message: '公司编码不能为空' })
  @IsString()
  @MaxLength(50)
  code: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class InitAdminDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

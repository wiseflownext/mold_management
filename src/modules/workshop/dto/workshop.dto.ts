import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkshopDto {
  @IsNotEmpty({ message: '车间名称不能为空' })
  @IsString()
  @MaxLength(50)
  name: string;
}

export class UpdateWorkshopDto extends CreateWorkshopDto {}

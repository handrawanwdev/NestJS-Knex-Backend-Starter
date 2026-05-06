import { IsOptional, IsString } from 'class-validator';

export class CreateVillageDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

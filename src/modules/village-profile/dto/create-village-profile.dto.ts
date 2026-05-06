import { IsOptional, IsString } from 'class-validator';

export class CreateVillageProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

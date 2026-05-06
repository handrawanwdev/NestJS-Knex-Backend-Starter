import { IsOptional, IsString } from 'class-validator';

export class CreateRolesDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

import { IsOptional, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

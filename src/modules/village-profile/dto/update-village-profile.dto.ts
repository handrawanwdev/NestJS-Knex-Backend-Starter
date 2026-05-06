import { PartialType } from '@nestjs/mapped-types';
import { CreateVillageProfileDto } from './create-village-profile.dto';

export class UpdateVillageProfileDto extends PartialType(CreateVillageProfileDto) {}

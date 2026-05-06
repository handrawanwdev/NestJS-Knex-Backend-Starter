import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VillageProfileService } from '../services/village-profile.service';
import { CreateVillageProfileDto } from '../dto/create-village-profile.dto';
import { UpdateVillageProfileDto } from '../dto/update-village-profile.dto';

@Controller('v1/village-profiles')
export class VillageProfileController {
  constructor(private readonly villageProfileService: VillageProfileService) {}

  private response<T = any>(
    data: T,
    message = 'Success',
    status = HttpStatus.OK,
  ) {
    return {
      status,
      message,
      data,
    };
  }

  @Post()
  async create(@Body() payload: CreateVillageProfileDto) {
    const data = await this.villageProfileService.create(payload);

    return this.response(
      data,
      'VillageProfile created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const data = await this.villageProfileService.findAll(query);

    return this.response(
      data,
      'VillageProfile list retrieved successfully',
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const data = await this.villageProfileService.findOne(uuid);

    return this.response(
      data,
      'VillageProfile detail retrieved successfully',
    );
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() payload: UpdateVillageProfileDto,
  ) {
    const data = await this.villageProfileService.update(uuid, payload);

    return this.response(
      data,
      'VillageProfile updated successfully',
    );
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    await this.villageProfileService.remove(uuid);

    return this.response(
      null,
      'VillageProfile deleted successfully',
    );
  }
}

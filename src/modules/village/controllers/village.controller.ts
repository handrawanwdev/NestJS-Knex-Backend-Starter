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
import { VillageService } from '../services/village.service';
import { CreateVillageDto } from '../dto/create-village.dto';
import { UpdateVillageDto } from '../dto/update-village.dto';

@Controller('v1/villages')
export class VillageController {
  constructor(private readonly villageService: VillageService) {}

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
  async create(@Body() payload: CreateVillageDto) {
    const data = await this.villageService.create(payload);

    return this.response(
      data,
      'Village created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const data = await this.villageService.findAll(query);

    return this.response(
      data,
      'Village list retrieved successfully',
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const data = await this.villageService.findOne(uuid);

    return this.response(
      data,
      'Village detail retrieved successfully',
    );
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() payload: UpdateVillageDto,
  ) {
    const data = await this.villageService.update(uuid, payload);

    return this.response(
      data,
      'Village updated successfully',
    );
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    await this.villageService.remove(uuid);

    return this.response(
      null,
      'Village deleted successfully',
    );
  }
}

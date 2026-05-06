import { Injectable, NotFoundException } from '@nestjs/common';
import { VillageRepository } from '../repositories/village.repository';
import { CreateVillageDto } from '../dto/create-village.dto';
import { UpdateVillageDto } from '../dto/update-village.dto';

@Injectable()
export class VillageService {
  constructor(private readonly villageRepository: VillageRepository) {}

  async create(payload: CreateVillageDto) {
    const data = await this.villageRepository.create(payload);

    return {
      status: 201,
      message: 'Village created successfully',
      data,
    };
  }

  async findAll(query: Record<string, any>) {
    const data = await this.villageRepository.findAll(query);

    return {
      status: 200,
      message: 'Village list retrieved successfully',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.villageRepository.findOne(id);

    if (!data) {
      throw new NotFoundException('Village not found');
    }

    return {
      status: 200,
      message: 'Village detail retrieved successfully',
      data,
    };
  }

  async update(id: string, payload: UpdateVillageDto) {
    const existingData = await this.villageRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('Village not found');
    }

    const data = await this.villageRepository.update(id, payload);

    return {
      status: 200,
      message: 'Village updated successfully',
      data,
    };
  }

  async remove(id: string) {
    const existingData = await this.villageRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('Village not found');
    }

    await this.villageRepository.remove(id);

    return {
      status: 200,
      message: 'Village deleted successfully',
      data: null,
    };
  }
}

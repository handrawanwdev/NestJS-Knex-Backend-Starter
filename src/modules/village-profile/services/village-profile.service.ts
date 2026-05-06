import { Injectable, NotFoundException } from '@nestjs/common';
import { VillageProfileRepository } from '../repositories/village-profile.repository';
import { CreateVillageProfileDto } from '../dto/create-village-profile.dto';
import { UpdateVillageProfileDto } from '../dto/update-village-profile.dto';

@Injectable()
export class VillageProfileService {
  constructor(private readonly villageProfileRepository: VillageProfileRepository) {}

  async create(payload: CreateVillageProfileDto) {
    const data = await this.villageProfileRepository.create(payload);

    return {
      status: 201,
      message: 'VillageProfile created successfully',
      data,
    };
  }

  async findAll(query: Record<string, any>) {
    const data = await this.villageProfileRepository.findAll(query);

    return {
      status: 200,
      message: 'VillageProfile list retrieved successfully',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.villageProfileRepository.findOne(id);

    if (!data) {
      throw new NotFoundException('VillageProfile not found');
    }

    return {
      status: 200,
      message: 'VillageProfile detail retrieved successfully',
      data,
    };
  }

  async update(id: string, payload: UpdateVillageProfileDto) {
    const existingData = await this.villageProfileRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('VillageProfile not found');
    }

    const data = await this.villageProfileRepository.update(id, payload);

    return {
      status: 200,
      message: 'VillageProfile updated successfully',
      data,
    };
  }

  async remove(id: string) {
    const existingData = await this.villageProfileRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('VillageProfile not found');
    }

    await this.villageProfileRepository.remove(id);

    return {
      status: 200,
      message: 'VillageProfile deleted successfully',
      data: null,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async create(payload: CreateAuthDto) {
    const data = await this.authRepository.create(payload);

    return {
      status: 201,
      message: 'Auth created successfully',
      data,
    };
  }

  async findAll(query: Record<string, any>) {
    const data = await this.authRepository.findAll(query);

    return {
      status: 200,
      message: 'Auth list retrieved successfully',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.authRepository.findOne(id);

    if (!data) {
      throw new NotFoundException('Auth not found');
    }

    return {
      status: 200,
      message: 'Auth detail retrieved successfully',
      data,
    };
  }

  async update(id: string, payload: UpdateAuthDto) {
    const existingData = await this.authRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('Auth not found');
    }

    const data = await this.authRepository.update(id, payload);

    return {
      status: 200,
      message: 'Auth updated successfully',
      data,
    };
  }

  async remove(id: string) {
    const existingData = await this.authRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('Auth not found');
    }

    await this.authRepository.remove(id);

    return {
      status: 200,
      message: 'Auth deleted successfully',
      data: null,
    };
  }
}

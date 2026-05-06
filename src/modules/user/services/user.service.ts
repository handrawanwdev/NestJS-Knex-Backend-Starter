import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(payload: CreateUserDto) {
    const data = await this.userRepository.create(payload);

    return {
      status: 201,
      message: 'User created successfully',
      data,
    };
  }

  async findAll(query: Record<string, any>) {
    const data = await this.userRepository.findAll(query);

    return {
      status: 200,
      message: 'User list retrieved successfully',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.userRepository.findOne(id);

    if (!data) {
      throw new NotFoundException('User not found');
    }

    return {
      status: 200,
      message: 'User detail retrieved successfully',
      data,
    };
  }

  async update(id: string, payload: UpdateUserDto) {
    const existingData = await this.userRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('User not found');
    }

    const data = await this.userRepository.update(id, payload);

    return {
      status: 200,
      message: 'User updated successfully',
      data,
    };
  }

  async remove(id: string) {
    const existingData = await this.userRepository.findOne(id);

    if (!existingData) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(id);

    return {
      status: 200,
      message: 'User deleted successfully',
      data: null,
    };
  }
}

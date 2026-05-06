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
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  async create(@Body() payload: CreateUserDto) {
    const data = await this.userService.create(payload);

    return this.response(
      data,
      'User created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const data = await this.userService.findAll(query);

    return this.response(
      data,
      'User list retrieved successfully',
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const data = await this.userService.findOne(uuid);

    return this.response(
      data,
      'User detail retrieved successfully',
    );
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() payload: UpdateUserDto,
  ) {
    const data = await this.userService.update(uuid, payload);

    return this.response(
      data,
      'User updated successfully',
    );
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    await this.userService.remove(uuid);

    return this.response(
      null,
      'User deleted successfully',
    );
  }
}

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
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';

@Controller('v1/auths')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async create(@Body() payload: CreateAuthDto) {
    const data = await this.authService.create(payload);

    return this.response(
      data,
      'Auth created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const data = await this.authService.findAll(query);

    return this.response(
      data,
      'Auth list retrieved successfully',
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const data = await this.authService.findOne(uuid);

    return this.response(
      data,
      'Auth detail retrieved successfully',
    );
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() payload: UpdateAuthDto,
  ) {
    const data = await this.authService.update(uuid, payload);

    return this.response(
      data,
      'Auth updated successfully',
    );
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    await this.authService.remove(uuid);

    return this.response(
      null,
      'Auth deleted successfully',
    );
  }
}

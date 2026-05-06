import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  private readonly tableName = 'user';

  async create(payload: CreateUserDto) {
    // TODO: Replace with Knex provider from libs/database.
    // return this.knex(this.tableName).insert(payload).returning('*');
    return {
      id: 'generated-id',
      ...payload,
    };
  }

  async findAll(query: Record<string, any>) {
    // TODO: Replace with Knex query.
    // return this.knex(this.tableName).whereNull('deleted_at').select('*');
    return {
      items: [],
      query,
    };
  }

  async findOne(id: string) {
    // TODO: Replace with Knex query.
    // return this.knex(this.tableName).where({ id }).whereNull('deleted_at').first();
    return {
      id,
    };
  }

  async update(id: string, payload: UpdateUserDto) {
    // TODO: Replace with Knex query.
    // return this.knex(this.tableName).where({ id }).update(payload).returning('*');
    return {
      id,
      ...payload,
    };
  }

  async remove(id: string) {
    // TODO: Prefer soft delete when table has deleted_at.
    // return this.knex(this.tableName).where({ id }).update({ deleted_at: new Date() });
    return {
      id,
      deleted: true,
    };
  }
}

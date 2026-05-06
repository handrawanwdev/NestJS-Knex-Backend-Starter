import { Injectable } from '@nestjs/common';
import { CreateVillageProfileDto } from '../dto/create-village-profile.dto';
import { UpdateVillageProfileDto } from '../dto/update-village-profile.dto';

@Injectable()
export class VillageProfileRepository {
  private readonly tableName = 'village_profile';

  async create(payload: CreateVillageProfileDto) {
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

  async update(id: string, payload: UpdateVillageProfileDto) {
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

import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectKnex } from '../../../database/decorators/inject-knex.decorator';

@Injectable()
export class AuthRepository {
  constructor(@InjectKnex() private readonly knex: Knex) { }

  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>) {
    return this.knex.transaction(callback);
  }

  async acquireRegisterFirstAccountLock(trx: Knex.Transaction) {
    /**
     * Fallback lock via PostgreSQL advisory lock.
     * Jika Redis provider sudah siap, bisa diganti dengan Redis lock:
     * boomdest:lock:register:first-account
     */
    await trx.raw(
      `SELECT pg_advisory_xact_lock(hashtext('boomdest:lock:register:first-account'))`,
    );
  }

  async countActiveUsers(trx?: Knex.Transaction): Promise<number> {
    const db = trx || this.knex;

    const result = await db('auth_user')
      .whereNull('deleted_at')
      .count<{ count: string }[]>({ count: '*' })
      .first();

    return Number(result?.count || 0);
  }

  async findUserByEmail(email: string, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    return db('auth_user')
      .where({ email })
      .whereNull('deleted_at')
      .first();
  }

  async findRoleByName(name: string, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    return db('auth_role')
      .where({ name })
      .whereNull('deleted_at')
      .first();
  }

  async findRoleByUuid(uuid: string, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    return db('auth_role')
      .where({ uuid })
      .whereNull('deleted_at')
      .first();
  }

  async findVillageByUuid(uuid: string, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    return db('village')
      .where({ uuid })
      .whereNull('deleted_at')
      .first();
  }

  async createUser(payload: Record<string, any>, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    const [user] = await db('auth_user')
      .insert(payload)
      .returning([
        'id',
        'uuid',
        'full_name',
        'email',
        'phone',
        'village_id',
        'status',
        'is_first_account',
        'created_at',
        'updated_at',
      ]);

    return user;
  }

  async assignUserRole(
    payload: {
      user_id: number;
      role_id: number;
      created_by?: number | null;
    },
    trx?: Knex.Transaction,
  ) {
    const db = trx || this.knex;

    const [userRole] = await db('auth_user_role')
      .insert({
        user_id: payload.user_id,
        role_id: payload.role_id,
        created_by: payload.created_by || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return userRole;
  }

  async updateLastLoginAt(userId: number, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    await db('auth_user')
      .where({ id: userId })
      .update({
        last_login_at: new Date(),
        updated_at: new Date(),
      });
  }

  async getUserRoles(userId: number, trx?: Knex.Transaction): Promise<string[]> {
    const db = trx || this.knex;

    const rows = await db('auth_user_role as aur')
      .join('auth_role as ar', 'ar.id', 'aur.role_id')
      .where('aur.user_id', userId)
      .whereNull('ar.deleted_at')
      .pluck('ar.name');

    return rows;
  }

  async getUserPermissions(
    userId: number,
    trx?: Knex.Transaction,
  ): Promise<string[]> {
    const db = trx || this.knex;

    const rows = await db('auth_user_role as aur')
      .join('auth_role as ar', 'ar.id', 'aur.role_id')
      .join('auth_role_permission as arp', 'arp.role_id', 'ar.id')
      .join('auth_permission as ap', 'ap.id', 'arp.permission_id')
      .where('aur.user_id', userId)
      .whereNull('ar.deleted_at')
      .whereNull('ap.deleted_at')
      .distinct('ap.name')
      .pluck('ap.name');

    return rows;
  }
}
import { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  /**
   * Auth user seed
   * Aman dijalankan berkali-kali.
   *
   * Catatan:
   * - Jangan hardcode password production.
   * - Password default hanya fallback untuk development.
   * - Pastikan seed role sudah jalan sebelum seed ini.
   */

  const now = knex.fn.now();

  const defaultPassword =
    process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';

  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const superAdminRole = await knex('auth_role')
    .where({
      name: 'super_admin',
    })
    .first();

  if (!superAdminRole) {
    throw new Error(
      'Role super_admin belum tersedia. Jalankan seed auth_role terlebih dahulu.',
    );
  }

  const existingUser = await knex('auth_user')
    .where({
      email: 'superadmin@boomdest.local',
    })
    .whereNull('deleted_at')
    .first();

  let userId: number;

  if (!existingUser) {
    const [createdUser] = await knex('auth_user')
      .insert({
        full_name: 'Super Admin',
        email: 'superadmin@boomdest.local',
        phone: null,
        password_hash: passwordHash,
        village_id: null,
        status: 'active',
        is_first_account: true,
        created_by: null,
        updated_by: null,
        deleted_by: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      })
      .returning(['id']);

    userId = createdUser.id;
  } else {
    userId = existingUser.id;

    await knex('auth_user')
      .where({ id: userId })
      .update({
        full_name: 'Super Admin',
        status: 'active',
        is_first_account: true,
        updated_at: now,
      });
  }

  await knex('auth_user_role')
    .insert({
      user_id: userId,
      role_id: superAdminRole.id,
      created_at: now,
    })
    .onConflict(['user_id', 'role_id'])
    .ignore();
}
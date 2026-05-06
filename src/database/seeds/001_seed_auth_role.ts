import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    const now = knex.fn.now();

    const rows = [
        {
            name: 'super_admin',
            label: 'Super Admin',
            description: 'Akses penuh ke seluruh sistem BoomDest.',
            is_system: true,
            status: 'active',
            created_by: null,
            updated_by: null,
            deleted_by: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        },
        {
            name: 'village_admin',
            label: 'Admin Desa',
            description: 'Admin utama untuk mengelola data dan user desa.',
            is_system: true,
            status: 'active',
            created_by: null,
            updated_by: null,
            deleted_by: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        },
        {
            name: 'village_staff',
            label: 'Staff Desa',
            description: 'Staff desa untuk operasional harian.',
            is_system: true,
            status: 'active',
            created_by: null,
            updated_by: null,
            deleted_by: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        },
    ];

    await knex('auth_role')
        .insert(rows)
        .onConflict('name')
        .merge({
            label: knex.raw('excluded.label'),
            description: knex.raw('excluded.description'),
            is_system: knex.raw('excluded.is_system'),
            status: knex.raw('excluded.status'),
            updated_at: now,
            deleted_at: null,
        });
}
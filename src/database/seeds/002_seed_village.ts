import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    const now = knex.fn.now();

    const rows = [
        {
            name: 'Desa Sukamaju',
            code: 'DSA-SUKAMAJU',
            address: 'Jl. Raya Sukamaju No. 01',
            province: 'Jawa Barat',
            city: 'Kabupaten Bandung',
            district: 'Sukamaju',
            postal_code: '40391',
            status: 'active',
            created_by: null,
            updated_by: null,
            deleted_by: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        },
        {
            name: 'Desa Mekarsari',
            code: 'DSA-MEKARSARI',
            address: 'Jl. Mekarsari Raya No. 12',
            province: 'Jawa Barat',
            city: 'Kabupaten Bogor',
            district: 'Mekarsari',
            postal_code: '16910',
            status: 'active',
            created_by: null,
            updated_by: null,
            deleted_by: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        },
        {
            name: 'Desa Tanjung Makmur',
            code: 'DSA-TANJUNG-MAKMUR',
            address: 'Jl. Pelabuhan Desa No. 05',
            province: 'Banten',
            city: 'Kabupaten Serang',
            district: 'Tanjung Makmur',
            postal_code: '42191',
            status: 'active',
            created_by: null,
            updated_by: null,
            deleted_by: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
        },
    ];

    await knex('village')
        .insert(rows)
        .onConflict('code')
        .merge({
            name: knex.raw('excluded.name'),
            address: knex.raw('excluded.address'),
            province: knex.raw('excluded.province'),
            city: knex.raw('excluded.city'),
            district: knex.raw('excluded.district'),
            postal_code: knex.raw('excluded.postal_code'),
            status: knex.raw('excluded.status'),
            updated_at: now,
            deleted_at: null,
        });
}
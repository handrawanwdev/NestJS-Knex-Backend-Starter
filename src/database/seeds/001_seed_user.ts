import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  /**
   * Seed data
   * Please adjust these rows based on the business requirement.
   * Use snake_case for all column names.
   * Keep this seed safe to run multiple times.
   */
  const rows = [
    {
      name: 'example',
      description: 'Example seed data',
      status: 'active',
    },
  ];

  /**
   * Insert seed data
   * onConflict('name').ignore() keeps this seed idempotent.
   * Make sure the conflict column has a unique constraint in the table.
   */
  await knex('user')
    .insert(rows)
    .onConflict('name')
    .ignore();
}

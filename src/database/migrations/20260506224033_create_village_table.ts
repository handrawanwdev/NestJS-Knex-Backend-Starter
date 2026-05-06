import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('village', (table) => {
    table.bigIncrements('id').primary();

    table
      .uuid('uuid')
      .notNullable()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name').notNullable();
    table.string('code').nullable().unique();
    table.text('address').nullable();
    table.string('province').nullable();
    table.string('city').nullable();
    table.string('district').nullable();
    table.string('postal_code').nullable();

    table.string('status').notNullable().defaultTo('active');

    table.bigInteger('created_by').unsigned().nullable();
    table.bigInteger('updated_by').unsigned().nullable();
    table.bigInteger('deleted_by').unsigned().nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    table.index(['uuid']);
    table.index(['code']);
    table.index(['status']);
    table.index(['created_at']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('village');
}
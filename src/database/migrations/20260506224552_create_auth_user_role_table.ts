import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('auth_user_role', (table) => {
    table.bigIncrements('id').primary();

    table
      .uuid('uuid')
      .notNullable()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .bigInteger('role_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('auth_role')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .bigInteger('created_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['user_id', 'role_id']);

    table.index(['uuid']);
    table.index(['user_id']);
    table.index(['role_id']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('auth_user_role');
}
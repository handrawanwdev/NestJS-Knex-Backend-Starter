import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('auth_permission', (table) => {
    table.bigIncrements('id').primary();

    table
      .uuid('uuid')
      .notNullable()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name').notNullable().unique();
    table.string('module').notNullable();
    table.string('action').notNullable();
    table.string('label').notNullable();
    table.text('description').nullable();

    table.boolean('is_system').notNullable().defaultTo(false);
    table.string('status').notNullable().defaultTo('active');

    table
      .bigInteger('created_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table
      .bigInteger('updated_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table
      .bigInteger('deleted_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    table.index(['uuid']);
    table.index(['name']);
    table.index(['module']);
    table.index(['action']);
    table.index(['status']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('auth_permission');
}
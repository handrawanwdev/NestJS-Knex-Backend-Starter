import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('auth_user', (table) => {
    table.bigIncrements('id').primary();

    table
      .uuid('uuid')
      .notNullable()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'));

    table.string('full_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('phone').nullable().unique();
    table.string('password_hash').notNullable();

    table
      .bigInteger('village_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('village')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.string('status').notNullable().defaultTo('active');
    table.boolean('is_first_account').notNullable().defaultTo(false);

    table.timestamp('last_login_at').nullable();

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
    table.index(['email']);
    table.index(['phone']);
    table.index(['village_id']);
    table.index(['status']);
    table.index(['created_at']);
    table.index(['deleted_at']);
  });

  await knex.schema.alterTable('village', (table) => {
    table
      .foreign('created_by')
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table
      .foreign('updated_by')
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table
      .foreign('deleted_by')
      .references('id')
      .inTable('auth_user')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('village', (table) => {
    table.dropForeign(['created_by']);
    table.dropForeign(['updated_by']);
    table.dropForeign(['deleted_by']);
  });

  await knex.schema.dropTableIfExists('auth_user');
}
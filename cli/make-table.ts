import * as fs from 'fs';
import * as path from 'path';

const rootDir = process.cwd();
const migrationsDir = path.join(rootDir, 'src', 'database', 'migrations');

const tableNameArg = process.argv[2];

if (!tableNameArg) {
    console.error('Table name is required.');
    console.error('Example: npm run make:table village-profile');
    console.error('Example: npm run make:table auth-user');
    process.exit(1);
}

function toSnakeCase(value: string): string {
    return value
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .replace(/__+/g, '_')
        .toLowerCase();
}

function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function getTimestamp(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
}

function getMigrationContent(tableName: string): string {
    return `
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('${tableName}', (table) => {
    table.bigIncrements('id').primary();

    table
      .uuid('uuid')
      .notNullable()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'));

    /**
     * Main columns
     * Please adjust these columns based on the business requirement.
     * Use snake_case for all column names.
     */
    table.string('name').notNullable();
    table.text('description').nullable();

    /**
     * Status column
     * Use lowercase and underscore format.
     * Example: active, inactive, pending, approved, rejected.
     */
    table.string('status').notNullable().defaultTo('active');

    /**
     * Audit columns
     * Use these columns if the table needs user tracking.
     * Remove them if this table does not need audit tracking.
     */
    table.bigInteger('created_by').unsigned().nullable();
    table.bigInteger('updated_by').unsigned().nullable();
    table.bigInteger('deleted_by').unsigned().nullable();

    /**
     * Timestamp columns
     */
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    /**
     * Soft delete column
     * Use deleted_at instead of hard delete for important business data.
     */
    table.timestamp('deleted_at').nullable();

    /**
     * Indexes
     * Add more indexes for frequently filtered columns.
     */
    table.index(['uuid']);
    table.index(['status']);
    table.index(['created_at']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('${tableName}');
}
`;
}

function createMigration(): void {
    ensureDir(migrationsDir);

    const tableName = toSnakeCase(tableNameArg);
    const timestamp = getTimestamp();

    const fileName = `${timestamp}_create_${tableName}_table.ts`;
    const filePath = path.join(migrationsDir, fileName);

    if (fs.existsSync(filePath)) {
        console.error(`Migration already exists: ${filePath}`);
        process.exit(1);
    }

    const content = getMigrationContent(tableName);

    fs.writeFileSync(filePath, content.trimStart(), 'utf8');

    console.log('');
    console.log('Migration table created successfully.');
    console.log(`Table name: ${tableName}`);
    console.log(`File path: src/database/migrations/${fileName}`);
    console.log('');
}

createMigration();
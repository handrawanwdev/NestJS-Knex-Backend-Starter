import * as fs from 'fs';
import * as path from 'path';

const rootDir = process.cwd();
const seedsDir = path.join(rootDir, 'src', 'database', 'seeds');

const seedNameArg = process.argv[2];

if (!seedNameArg) {
    console.error('Seed name is required.');
    console.error('Example: npm run make:seed auth-role');
    console.error('Example: npm run make:seed auth-permission');
    console.error('Example: npm run make:seed village');
    process.exit(1);
}

function toSnakeCase(value: string): string {
    return value
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .replace(/__+/g, '_')
        .toLowerCase();
}

function toKebabCase(value: string): string {
    return value
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .replace(/--+/g, '-')
        .toLowerCase();
}

function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function getNextSeedNumber(): string {
    ensureDir(seedsDir);

    const files = fs
        .readdirSync(seedsDir)
        .filter((file) => file.endsWith('.ts'));

    if (files.length === 0) {
        return '001';
    }

    const numbers = files
        .map((file) => {
            const match = file.match(/^(\d+)_/);
            return match ? Number(match[1]) : 0;
        })
        .filter((number) => number > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    return String(nextNumber).padStart(3, '0');
}

function getSeedContent(tableName: string): string {
    return `
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
  await knex('${tableName}')
    .insert(rows)
    .onConflict('name')
    .ignore();
}
`;
}

function createSeed(): void {
    ensureDir(seedsDir);

    const seedName = toKebabCase(seedNameArg);
    const tableName = toSnakeCase(seedNameArg);
    const seedNumber = getNextSeedNumber();

    const fileName = `${seedNumber}_seed_${seedName}.ts`;
    const filePath = path.join(seedsDir, fileName);

    if (fs.existsSync(filePath)) {
        console.error(`Seed already exists: ${filePath}`);
        process.exit(1);
    }

    const content = getSeedContent(tableName);

    fs.writeFileSync(filePath, content.trimStart(), 'utf8');

    console.log('');
    console.log('Seed file created successfully.');
    console.log(`Seed name: ${seedName}`);
    console.log(`Table name: ${tableName}`);
    console.log(`File path: database/seeds/${fileName}`);
    console.log('');
}

createSeed();
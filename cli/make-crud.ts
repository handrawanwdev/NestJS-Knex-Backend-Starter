import * as fs from 'fs';
import * as path from 'path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const modulesDir = path.join(srcDir, 'modules');
const appModulePath = path.join(srcDir, 'app.module.ts');

const moduleNameArg = process.argv[2];
const entityNameArg = process.argv[3];

if (!moduleNameArg) {
  console.error('Module name is required.');
  console.error('Example: npm run make:crud village-profile');
  process.exit(1);
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase();
}

function toPascalCase(value: string): string {
  return toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toPluralRoute(value: string): string {
  const kebab = toKebabCase(value);

  if (kebab.endsWith('s')) {
    return kebab;
  }

  return `${kebab}s`;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileOnce(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    console.warn(`Skipped existing file: ${filePath}`);
    return;
  }

  fs.writeFileSync(filePath, content.trimStart(), 'utf8');
  console.log(`Created: ${filePath}`);
}

function ensureAppModuleExists(): void {
  if (fs.existsSync(appModulePath)) {
    return;
  }

  const defaultAppModule = `
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
`;

  fs.writeFileSync(appModulePath, defaultAppModule.trimStart(), 'utf8');
  console.log(`Created: ${appModulePath}`);
}

function addImportIfMissing(content: string, importStatement: string): string {
  if (content.includes(importStatement)) {
    return content;
  }

  const importRegex = /import .+ from ['"].+['"];\n/g;
  const imports = content.match(importRegex);

  if (!imports || imports.length === 0) {
    return `${importStatement}\n${content}`;
  }

  const lastImport = imports[imports.length - 1];

  return content.replace(lastImport, `${lastImport}${importStatement}\n`);
}

function ensureModuleArray(content: string, key: 'controllers' | 'providers'): string {
  const arrayRegex = new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');

  if (arrayRegex.test(content)) {
    return content;
  }

  return content.replace(
    /@Module\s*\(\s*\{/m,
    `@Module({\n  ${key}: [],`,
  );
}

function addClassToModuleArray(
  content: string,
  key: 'controllers' | 'providers',
  className: string,
): string {
  content = ensureModuleArray(content, key);

  const arrayRegex = new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = content.match(arrayRegex);

  if (!match) {
    return content;
  }

  const currentItems = match[1];

  // Cek hanya di dalam array controllers/providers, bukan seluruh file.
  if (new RegExp(`\\b${className}\\b`).test(currentItems)) {
    return content;
  }

  return content.replace(arrayRegex, (_fullMatch, items) => {
    const cleanItems = items.trim();

    if (!cleanItems) {
      return `${key}: [${className}]`;
    }

    return `${key}: [\n    ${cleanItems.replace(/,\s*$/, '')},\n    ${className}\n  ]`;
  });
}

function registerCrudToAppModule(moduleName: string): void {
  ensureAppModuleExists();

  const kebabModuleName = toKebabCase(moduleName);

  const controllerClassName = `${toPascalCase(moduleName)}Controller`;
  const serviceClassName = `${toPascalCase(moduleName)}Service`;
  const repositoryClassName = `${toPascalCase(moduleName)}Repository`;

  const controllerImport = `import { ${controllerClassName} } from './modules/${kebabModuleName}/controllers/${kebabModuleName}.controller';`;
  const serviceImport = `import { ${serviceClassName} } from './modules/${kebabModuleName}/services/${kebabModuleName}.service';`;
  const repositoryImport = `import { ${repositoryClassName} } from './modules/${kebabModuleName}/repositories/${kebabModuleName}.repository';`;

  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

  appModuleContent = addImportIfMissing(appModuleContent, controllerImport);
  appModuleContent = addImportIfMissing(appModuleContent, serviceImport);
  appModuleContent = addImportIfMissing(appModuleContent, repositoryImport);

  appModuleContent = addClassToModuleArray(
    appModuleContent,
    'controllers',
    controllerClassName,
  );

  appModuleContent = addClassToModuleArray(
    appModuleContent,
    'providers',
    serviceClassName,
  );

  appModuleContent = addClassToModuleArray(
    appModuleContent,
    'providers',
    repositoryClassName,
  );

  fs.writeFileSync(appModulePath, appModuleContent, 'utf8');

  console.log(`Registered ${controllerClassName} to src/app.module.ts controllers`);
  console.log(`Registered ${serviceClassName} to src/app.module.ts providers`);
  console.log(`Registered ${repositoryClassName} to src/app.module.ts providers`);
}

const moduleName = toKebabCase(moduleNameArg);
const entityName = toKebabCase(entityNameArg || moduleNameArg);

const controllerClassName = `${toPascalCase(moduleName)}Controller`;
const serviceClassName = `${toPascalCase(moduleName)}Service`;
const repositoryClassName = `${toPascalCase(moduleName)}Repository`;
const createDtoClassName = `Create${toPascalCase(entityName)}Dto`;
const updateDtoClassName = `Update${toPascalCase(entityName)}Dto`;

const serviceVariableName = `${toCamelCase(moduleName)}Service`;
const repositoryVariableName = `${toCamelCase(moduleName)}Repository`;

const modulePath = path.join(modulesDir, moduleName);

const folders = [
  modulePath,
  path.join(modulePath, 'controllers'),
  path.join(modulePath, 'services'),
  path.join(modulePath, 'repositories'),
  path.join(modulePath, 'dto'),
  path.join(modulePath, 'constants'),
  path.join(modulePath, 'types'),
  path.join(modulePath, 'mappers'),
];

folders.forEach(ensureDir);

const controllerFile = `
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ${serviceClassName} } from '../services/${moduleName}.service';
import { ${createDtoClassName} } from '../dto/create-${entityName}.dto';
import { ${updateDtoClassName} } from '../dto/update-${entityName}.dto';

@Controller('v1/${toPluralRoute(moduleName)}')
export class ${controllerClassName} {
  constructor(private readonly ${serviceVariableName}: ${serviceClassName}) {}

  private response<T = any>(
    data: T,
    message = 'Success',
    status = HttpStatus.OK,
  ) {
    return {
      status,
      message,
      data,
    };
  }

  @Post()
  async create(@Body() payload: ${createDtoClassName}) {
    const data = await this.${serviceVariableName}.create(payload);

    return this.response(
      data,
      '${toPascalCase(entityName)} created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const data = await this.${serviceVariableName}.findAll(query);

    return this.response(
      data,
      '${toPascalCase(entityName)} list retrieved successfully',
    );
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    const data = await this.${serviceVariableName}.findOne(uuid);

    return this.response(
      data,
      '${toPascalCase(entityName)} detail retrieved successfully',
    );
  }

  @Patch(':uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() payload: ${updateDtoClassName},
  ) {
    const data = await this.${serviceVariableName}.update(uuid, payload);

    return this.response(
      data,
      '${toPascalCase(entityName)} updated successfully',
    );
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string) {
    await this.${serviceVariableName}.remove(uuid);

    return this.response(
      null,
      '${toPascalCase(entityName)} deleted successfully',
    );
  }
}
`;

const serviceFile = `
import { Injectable, NotFoundException } from '@nestjs/common';
import { ${repositoryClassName} } from '../repositories/${moduleName}.repository';
import { ${createDtoClassName} } from '../dto/create-${entityName}.dto';
import { ${updateDtoClassName} } from '../dto/update-${entityName}.dto';

@Injectable()
export class ${serviceClassName} {
  constructor(private readonly ${repositoryVariableName}: ${repositoryClassName}) {}

  async create(payload: ${createDtoClassName}) {
    const data = await this.${repositoryVariableName}.create(payload);

    return {
      status: 201,
      message: '${toPascalCase(entityName)} created successfully',
      data,
    };
  }

  async findAll(query: Record<string, any>) {
    const data = await this.${repositoryVariableName}.findAll(query);

    return {
      status: 200,
      message: '${toPascalCase(entityName)} list retrieved successfully',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.${repositoryVariableName}.findOne(id);

    if (!data) {
      throw new NotFoundException('${toPascalCase(entityName)} not found');
    }

    return {
      status: 200,
      message: '${toPascalCase(entityName)} detail retrieved successfully',
      data,
    };
  }

  async update(id: string, payload: ${updateDtoClassName}) {
    const existingData = await this.${repositoryVariableName}.findOne(id);

    if (!existingData) {
      throw new NotFoundException('${toPascalCase(entityName)} not found');
    }

    const data = await this.${repositoryVariableName}.update(id, payload);

    return {
      status: 200,
      message: '${toPascalCase(entityName)} updated successfully',
      data,
    };
  }

  async remove(id: string) {
    const existingData = await this.${repositoryVariableName}.findOne(id);

    if (!existingData) {
      throw new NotFoundException('${toPascalCase(entityName)} not found');
    }

    await this.${repositoryVariableName}.remove(id);

    return {
      status: 200,
      message: '${toPascalCase(entityName)} deleted successfully',
      data: null,
    };
  }
}
`;

const repositoryFile = `
import { Injectable } from '@nestjs/common';
import { ${createDtoClassName} } from '../dto/create-${entityName}.dto';
import { ${updateDtoClassName} } from '../dto/update-${entityName}.dto';

@Injectable()
export class ${repositoryClassName} {
  private readonly tableName = '${moduleName.replace(/-/g, '_')}';

  async create(payload: ${createDtoClassName}) {
    // TODO: Replace with Knex provider from libs/database.
    // return this.knex(this.tableName).insert(payload).returning('*');
    return {
      id: 'generated-id',
      ...payload,
    };
  }

  async findAll(query: Record<string, any>) {
    // TODO: Replace with Knex query.
    // return this.knex(this.tableName).whereNull('deleted_at').select('*');
    return {
      items: [],
      query,
    };
  }

  async findOne(id: string) {
    // TODO: Replace with Knex query.
    // return this.knex(this.tableName).where({ id }).whereNull('deleted_at').first();
    return {
      id,
    };
  }

  async update(id: string, payload: ${updateDtoClassName}) {
    // TODO: Replace with Knex query.
    // return this.knex(this.tableName).where({ id }).update(payload).returning('*');
    return {
      id,
      ...payload,
    };
  }

  async remove(id: string) {
    // TODO: Prefer soft delete when table has deleted_at.
    // return this.knex(this.tableName).where({ id }).update({ deleted_at: new Date() });
    return {
      id,
      deleted: true,
    };
  }
}
`;

const createDtoFile = `
import { IsOptional, IsString } from 'class-validator';

export class ${createDtoClassName} {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
`;

const updateDtoFile = `
import { PartialType } from '@nestjs/mapped-types';
import { ${createDtoClassName} } from './create-${entityName}.dto';

export class ${updateDtoClassName} extends PartialType(${createDtoClassName}) {}
`;

writeFileOnce(
  path.join(modulePath, 'controllers', `${moduleName}.controller.ts`),
  controllerFile,
);

writeFileOnce(
  path.join(modulePath, 'services', `${moduleName}.service.ts`),
  serviceFile,
);

writeFileOnce(
  path.join(modulePath, 'repositories', `${moduleName}.repository.ts`),
  repositoryFile,
);

writeFileOnce(
  path.join(modulePath, 'dto', `create-${entityName}.dto.ts`),
  createDtoFile,
);

writeFileOnce(
  path.join(modulePath, 'dto', `update-${entityName}.dto.ts`),
  updateDtoFile,
);

registerCrudToAppModule(moduleName);

console.log('');
console.log('CRUD generated successfully.');
console.log(`Module path: src/modules/${moduleName}`);
console.log('Generated structure:');
console.log(`
src/modules/${moduleName}/
├── controllers/
│   └── ${moduleName}.controller.ts
├── services/
│   └── ${moduleName}.service.ts
├── repositories/
│   └── ${moduleName}.repository.ts
├── dto/
│   ├── create-${entityName}.dto.ts
│   └── update-${entityName}.dto.ts
├── constants/
├── types/
└── mappers/
`);
import * as fs from 'fs';
import * as path from 'path';

const rootDir = process.cwd();

const processorsDir = path.join(rootDir, 'src', 'workers', 'processors');

const workersModulePath = path.join(
    rootDir,
    'src',
    'workers',
    'workers.module.ts',
);

const workerJobConstantPath = path.join(
    rootDir,
    'src',
    'workers',
    'constants',
    'worker-job.constant.ts',
);

const processorNameArg = process.argv[2];

if (!processorNameArg) {
    console.error('Processor name is required.');
    console.error('Example: npm run make:job-processor report-export');
    console.error('Example: npm run make:job-processor audit-log');
    console.error('Example: npm run make:job-processor data-import');
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

function toSnakeCase(value: string): string {
    return toKebabCase(value).replace(/-/g, '_');
}

function toConstantCase(value: string): string {
    return toSnakeCase(value).toUpperCase();
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

function ensureProvidersArray(content: string): string {
    const providersRegex = /providers\s*:\s*\[([\s\S]*?)\]/m;

    if (providersRegex.test(content)) {
        return content;
    }

    return content.replace(
        /@Module\s*\(\s*\{/m,
        `@Module({\n  providers: [],`,
    );
}

function addProviderIfMissing(content: string, className: string): string {
    content = ensureProvidersArray(content);

    const providersRegex = /providers\s*:\s*\[([\s\S]*?)\]/m;
    const match = content.match(providersRegex);

    if (!match) {
        return content;
    }

    const currentProviders = match[1];

    if (new RegExp(`\\b${className}\\b`).test(currentProviders)) {
        return content;
    }

    return content.replace(providersRegex, (_fullMatch, providers) => {
        const cleanProviders = providers.trim();

        if (!cleanProviders) {
            return `providers: [${className}]`;
        }

        return `providers: [\n    ${cleanProviders.replace(/,\s*$/, '')},\n    ${className},\n  ]`;
    });
}

function ensureWorkersModuleExists(): void {
    if (fs.existsSync(workersModulePath)) {
        return;
    }

    const defaultWorkersModule = `
import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [],
})
export class WorkersModule {}
`;

    ensureDir(path.dirname(workersModulePath));
    fs.writeFileSync(workersModulePath, defaultWorkersModule.trimStart(), 'utf8');
    console.log(`Created: ${workersModulePath}`);
}

function registerProcessorToWorkersModule(
    processorName: string,
    processorClassName: string,
): void {
    ensureWorkersModuleExists();

    const importStatement = `import { ${processorClassName} } from './processors/${processorName}.processor';`;

    let workersModuleContent = fs.readFileSync(workersModulePath, 'utf8');

    workersModuleContent = addImportIfMissing(
        workersModuleContent,
        importStatement,
    );

    workersModuleContent = addProviderIfMissing(
        workersModuleContent,
        processorClassName,
    );

    fs.writeFileSync(workersModulePath, workersModuleContent, 'utf8');

    console.log(
        `Registered ${processorClassName} to src/workers/workers.module.ts`,
    );
}

function ensureWorkerJobConstantExists(): void {
    if (fs.existsSync(workerJobConstantPath)) {
        return;
    }

    ensureDir(path.dirname(workerJobConstantPath));

    const defaultContent = `
export const WORKER_JOB = {
  DEFAULT_TEST: 'default.test',
} as const;

export type WorkerJob = (typeof WORKER_JOB)[keyof typeof WORKER_JOB];
`;

    fs.writeFileSync(workerJobConstantPath, defaultContent.trimStart(), 'utf8');
    console.log(`Created: ${workerJobConstantPath}`);
}

function registerJobToWorkerJobConstant(
    constantName: string,
    jobName: string,
): void {
    ensureWorkerJobConstantExists();

    let content = fs.readFileSync(workerJobConstantPath, 'utf8');

    const constantRegex = new RegExp(`\\b${constantName}\\b\\s*:`);
    const jobValueRegex = new RegExp(`['"]${jobName}['"]`);

    if (constantRegex.test(content) || jobValueRegex.test(content)) {
        console.log(
            `Skipped existing worker job constant: ${constantName}: '${jobName}'`,
        );
        return;
    }

    const workerJobObjectRegex =
        /export\s+const\s+WORKER_JOB\s*=\s*\{([\s\S]*?)\}\s*as\s+const;/m;

    const match = content.match(workerJobObjectRegex);

    if (!match) {
        console.error('Cannot find WORKER_JOB object in worker-job.constant.ts');
        process.exit(1);
    }

    const newLine = `  ${constantName}: '${jobName}',`;

    content = content.replace(workerJobObjectRegex, (_fullMatch, objectBody) => {
        const cleanBody = objectBody.trimEnd();

        return `export const WORKER_JOB = {${cleanBody ? `${cleanBody}\n` : '\n'}${newLine}\n} as const;`;
    });

    fs.writeFileSync(workerJobConstantPath, content, 'utf8');

    console.log(`Registered worker job constant: ${constantName}: '${jobName}'`);
}

function getProcessorContent(
    processorName: string,
    processorClassName: string,
    jobName: string,
): string {
    return `
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { QUEUE_NAME } from '../../queue/constants/queue-name.constant';
import { WorkerJobPayload } from '../types/worker-job-payload.type';

@Injectable()
@Processor(QUEUE_NAME.DEFAULT)
export class ${processorClassName} extends WorkerHost {
  private readonly logger = new Logger(${processorClassName}.name);

  /**
   * Processor: ${processorName}
   *
   * Please adjust the job handling logic based on the business requirement.
   * Keep the processor idempotent because failed jobs may be retried.
   */
  async process(job: Job<WorkerJobPayload>): Promise<any> {
    this.logger.log(\`Processing job: \${job.name} | ID: \${job.id}\`);

    if (job.name !== '${jobName}') {
      return {
        status: 'skipped',
        message: \`Skipped job: \${job.name}\`,
      };
    }

    return this.handleJob(job);
  }

  private async handleJob(job: Job<WorkerJobPayload>) {
    this.logger.log(\`${processorClassName} payload: \${JSON.stringify(job.data)}\`);

    /**
     * TODO:
     * Add business logic here.
     * Example:
     * - Generate report
     * - Import data
     * - Export data
     * - Cleanup expired data
     * - Write async audit log
     */
    return {
      status: 'success',
      message: '${processorName} processed successfully',
      data: job.data,
    };
  }
}
`;
}

function createJobProcessor(): void {
    ensureDir(processorsDir);

    const processorName = toKebabCase(processorNameArg);
    const processorClassName = `${toPascalCase(processorName)}Processor`;
    const jobName = toSnakeCase(processorName);
    const constantName = toConstantCase(processorName);

    const processorFileName = `${processorName}.processor.ts`;
    const processorFilePath = path.join(processorsDir, processorFileName);

    const processorContent = getProcessorContent(
        processorName,
        processorClassName,
        jobName,
    );

    writeFileOnce(processorFilePath, processorContent);

    registerProcessorToWorkersModule(processorName, processorClassName);
    registerJobToWorkerJobConstant(constantName, jobName);

    console.log('');
    console.log('Job processor generated successfully.');
    console.log(`Processor name: ${processorName}`);
    console.log(`Processor class: ${processorClassName}`);
    console.log(`Job name: ${jobName}`);
    console.log(`Worker job constant: ${constantName}: '${jobName}'`);
    console.log(`File path: src/workers/processors/${processorFileName}`);
    console.log('');
}

createJobProcessor();
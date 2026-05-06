import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

interface CustomValidationPipeOptions {
  transform?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  enableImplicitConversion?: boolean;
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly enableTransform: boolean;
  private readonly enableWhitelist: boolean;
  private readonly enableForbidNonWhitelisted: boolean;
  private readonly enableImplicitConversion: boolean;

  constructor(options: CustomValidationPipeOptions = {}) {
    this.enableTransform = options.transform ?? false;
    this.enableWhitelist = options.whitelist ?? false;
    this.enableForbidNonWhitelisted = options.forbidNonWhitelisted ?? false;
    this.enableImplicitConversion = options.enableImplicitConversion ?? false;
  }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    if (value === undefined || value === null || value === '') {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: this.enableImplicitConversion,
      excludeExtraneousValues: this.enableWhitelist,
    });
    
    if (!object || typeof object !== 'object' || Array.isArray(object)) {
      return value;
    }

    const errors = await validate(object, {
      whitelist: this.enableWhitelist,
      forbidNonWhitelisted: this.enableForbidNonWhitelisted,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: formattedErrors,
        },
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): string[] {
    const formattedErrors: string[] = [];

    for (const error of errors) {
      const constraints = error.constraints;
      if (constraints) {
        for (const key in constraints) {
          formattedErrors.push(`${error.property}: ${constraints[key]}`);
        }
      }
    }

    return formattedErrors;
  }
}

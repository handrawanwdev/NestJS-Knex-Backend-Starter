import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error: {
    code: string;
    details?: string | string[];
    statusCode?: number;
  };
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the actual error for debugging
    console.error('Exception caught:', exception);
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('Unhandled error:', exception);
      if (exception instanceof Error) {
        console.error('Stack trace:', exception.stack);
      }
    }

    // Check if this is a custom response object from HttpException
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const exceptionMessage = exception instanceof HttpException ? exception.message : 'Internal server error';

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const customResponse = exceptionResponse as any;
      // Only use custom response if it has bulk validation structure (failed/errors fields)
      if (customResponse.failed !== undefined || customResponse.errors !== undefined) {
        response.status(status).json({
          success: customResponse.success ?? false,
          message: customResponse.message || this.getErrorMessage(status, exceptionMessage),
          data: customResponse,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        return;
      }
    }

    const message = exceptionMessage;

    // Check if this is a validation error (BadRequestException)
    let errorDetails: string | string[] = message;
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;
      // Handle NestJS built-in ValidationPipe format
      if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        errorDetails = exceptionResponse.message;
      } else if (exceptionResponse.error?.details) {
        errorDetails = exceptionResponse.error.details;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
        errorDetails = exceptionResponse.message;
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message: this.getErrorMessage(status, message),
      error: {
        code: this.getErrorCode(status),
        details: errorDetails,
        statusCode: status,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(status: number, message: string): string {
    const errorMessages: Record<number, string> = {
      400: 'Bad request - Invalid input',
      401: 'Unauthorized - Invalid or missing credentials',
      403: 'Forbidden - Insufficient permissions',
      404: 'Resource not found',
      409: 'Conflict - Resource already exists',
      422: 'Unprocessable entity - Validation failed',
      500: 'Internal server error',
    };

    return errorMessages[status] || message;
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}

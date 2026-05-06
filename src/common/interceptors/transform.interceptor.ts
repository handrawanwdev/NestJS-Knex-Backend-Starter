import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: string;
  };
  timestamp: string;
  path?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: this.getDefaultMessage(request.method, response.statusCode),
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }

  private getDefaultMessage(method: string, statusCode: number): string {
    const messages: Record<string, Record<number, string>> = {
      GET: {
        200: 'Data retrieved successfully',
        201: 'Resource created successfully',
      },
      POST: {
        200: 'Operation completed successfully',
        201: 'Resource created successfully',
      },
      PUT: {
        200: 'Resource updated successfully',
      },
      PATCH: {
        200: 'Resource partially updated successfully',
      },
      DELETE: {
        200: 'Resource deleted successfully',
        204: 'Resource deleted successfully',
      },
    };

    return messages[method]?.[statusCode] || 'Request completed successfully';
  }
}

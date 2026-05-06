import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import toobusy = require('toobusy-js');
import compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  /**
   * Reject requests when the event loop is too busy.
   * This helps protect the API from overload.
   */
  toobusy.maxLag(Number(process.env.TOOBUSY_MAX_LAG || 70));
  toobusy.interval(Number(process.env.TOOBUSY_INTERVAL || 500));

  app.use((req, res, next) => {
    if (toobusy()) {
      return res.status(503).json({
        status: 503,
        message: 'Server is busy',
        data: null,
        error: 'Server is currently too busy. Please try again later.',
      });
    }

    next();
  });

  /**
   * Security headers
   */
  app.use(
    helmet({
      contentSecurityPolicy: process.env.APP_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    }),
  );

  /**
   * Response compression
   */
  app.use(compression());

  /**
   * CORS
   */
  app.enableCors({
    origin:
      process.env.APP_ENV === 'production'
        ? (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400,
  });

  /**
   * API prefix
   * Example: /api/v1/village-profiles
   */
  app.setGlobalPrefix('api');

  /**
   * Global validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  /**
   * Global response and error handling
   */
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  /**
   * Graceful shutdown
   */
  app.enableShutdownHooks();

  const port = Number(process.env.APP_PORT || 3000);

  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on port ${port}`);

  /**
   * Cleanup toobusy interval on shutdown.
   */
  const shutdown = () => {
    toobusy.shutdown();
    process.exit();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

bootstrap();
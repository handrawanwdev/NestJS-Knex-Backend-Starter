import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('hello')
  getHello(): string {
    return 'Hello from BUMDES API! Docker is running properly.';
  }
}

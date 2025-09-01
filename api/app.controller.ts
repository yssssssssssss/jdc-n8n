import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return {
      success: true,
      message: 'API服务运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('test')
  getTest() {
    console.log('AppService:', this.appService);
    if (!this.appService) {
      return { error: 'AppService not injected' };
    }
    return this.appService.getHealth();
  }
}
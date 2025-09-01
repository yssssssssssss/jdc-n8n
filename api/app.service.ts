import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    try {
      return {
        success: true,
        message: 'API服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
    } catch (error) {
      return {
        success: false,
        message: '服务异常',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
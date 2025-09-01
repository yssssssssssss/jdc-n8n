import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { CredentialModule } from './modules/credential';
import { ExecutionModule } from './modules/execution';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    WorkflowModule,
    CredentialModule,
    ExecutionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
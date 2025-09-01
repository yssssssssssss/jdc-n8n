import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { Execution } from './execution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Execution])],
  controllers: [ExecutionController],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
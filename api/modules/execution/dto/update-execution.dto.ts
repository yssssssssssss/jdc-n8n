import { PartialType } from '@nestjs/mapped-types';
import { CreateExecutionDto } from './create-execution.dto';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ExecutionStatus } from '../execution.entity';

export class UpdateExecutionDto extends PartialType(CreateExecutionDto) {
  @IsOptional()
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { ExecutionStatus } from '../execution.entity';

export class CreateExecutionDto {
  @IsNumber()
  workflowId: number;

  @IsOptional()
  @IsString()
  inputData?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsString()
  trig
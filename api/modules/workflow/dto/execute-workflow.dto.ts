import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsObject } from 'class-validator';

export class ExecuteWorkflowDto {
  @ApiProperty({ 
    description: '输入数据（JSON格式）', 
    example: { input: 'test data' },
    required: false 
  })
  @IsOptional()
  @IsObject()
  inputData?: any;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateWorkflowDto {
  @ApiProperty({ description: '工作流名称', example: '更新的工作流名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: '工作流定义（JSON格式）', 
    example: { nodes: [], connections: [] },
    required: false 
  })
  @IsOptional()
  @IsObject()
  definition?: any;

  @ApiProperty({ description: '是否激活', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
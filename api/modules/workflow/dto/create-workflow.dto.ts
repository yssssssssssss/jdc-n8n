import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateWorkflowDto {
  @ApiProperty({ description: '工作流名称', example: '我的第一个工作流' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: '工作流定义（JSON格式）', 
    example: { nodes: [], connections: [] } 
  })
  @IsObject()
  definition: any;

  @ApiProperty({ description: '是否激活', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
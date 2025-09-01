import { ApiProperty } from '@nestjs/swagger';

export class Workflow {
  @ApiProperty({ description: '工作流ID' })
  id: string;

  @ApiProperty({ description: '工作流名称' })
  name: string;

  @ApiProperty({ description: '工作流定义（JSON格式）' })
  definition: any;

  @ApiProperty({ description: '是否激活' })
  isActive: boolean;

  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
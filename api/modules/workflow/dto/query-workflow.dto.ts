import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryWorkflowDto {
  @ApiProperty({ description: '页码', example: '1', required: false })
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @ApiProperty({ description: '每页数量', example: '10', required: false })
  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @ApiProperty({ description: '搜索关键词', example: '工作流名称', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '是否激活', example: 'true', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}
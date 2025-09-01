import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto, QueryWorkflowDto, ExecuteWorkflowDto } from './dto';
import { Workflow } from './workflow.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('工作流管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @ApiOperation({ summary: '创建工作流' })
  @ApiResponse({ status: 201, description: '工作流创建成功', type: Workflow })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async create(
    @Body() createWorkflowDto: CreateWorkflowDto,
    @Request() req: any,
  ): Promise<Workflow> {
    return this.workflowService.create(createWorkflowDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取工作流列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findAll(
    @Query() queryDto: QueryWorkflowDto,
    @Request() req: any,
  ) {
    return this.workflowService.findAll(queryDto, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个工作流详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Workflow })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Workflow> {
    return this.workflowService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新工作流' })
  @ApiResponse({ status: 200, description: '更新成功', type: Workflow })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @Request() req: any,
  ): Promise<Workflow> {
    return this.workflowService.update(id, updateWorkflowDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除工作流' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.workflowService.remove(id, req.user.userId);
    return { message: '工作流删除成功' };
  }

  @Post(':id/execute')
  @ApiOperation({ summary: '执行工作流' })
  @ApiResponse({ status: 200, description: '执行成功' })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  @ApiResponse({ status: 403, description: '工作流未激活' })
  @ApiResponse({ status: 401, description: '未授权' })
  async execute(
    @Param('id') id: string,
    @Body() executeDto: ExecuteWorkflowDto,
    @Request() req: any,
  ) {
    return this.workflowService.execute(id, executeDto, req.user.userId);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: '获取工作流执行历史' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '工作流不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getExecutions(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.workflowService.getExecutions(id, req.user.userId);
  }
}
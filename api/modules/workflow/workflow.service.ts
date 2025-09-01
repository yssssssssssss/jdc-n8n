import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto, UpdateWorkflowDto, QueryWorkflowDto, ExecuteWorkflowDto } from './dto';
import { Workflow } from './workflow.entity';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto, userId: string): Promise<Workflow> {
    const workflow = await this.prisma.workflow.create({
      data: {
        name: createWorkflowDto.name,
        definition: createWorkflowDto.definition,
        isActive: createWorkflowDto.isActive ?? true,
        userId,
      },
    });

    return workflow;
  }

  async findAll(queryDto: QueryWorkflowDto, userId: string) {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (queryDto.search) {
      where.name = {
        contains: queryDto.search,
        mode: 'insensitive',
      };
    }

    if (queryDto.isActive !== undefined) {
      where.isActive = queryDto.isActive;
    }

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data: workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Workflow> {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!workflow) {
      throw new NotFoundException('工作流不存在');
    }

    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto, userId: string): Promise<Workflow> {
    // 先检查工作流是否存在且属于当前用户
    await this.findOne(id, userId);

    const workflow = await this.prisma.workflow.update({
      where: { id },
      data: updateWorkflowDto,
    });

    return workflow;
  }

  async remove(id: string, userId: string): Promise<void> {
    // 先检查工作流是否存在且属于当前用户
    await this.findOne(id, userId);

    await this.prisma.workflow.delete({
      where: { id },
    });
  }

  async execute(id: string, executeDto: ExecuteWorkflowDto, userId: string) {
    // 检查工作流是否存在且属于当前用户
    const workflow = await this.findOne(id, userId);

    if (!workflow.isActive) {
      throw new ForbiddenException('工作流未激活，无法执行');
    }

    // 创建执行记录
    const execution = await this.prisma.execution.create({
      data: {
        status: 'RUNNING',
        inputData: executeDto.inputData || {},
        workflowId: id,
        userId,
        logs: [],
      },
    });

    // 这里应该实现实际的工作流执行逻辑
    // 目前先模拟执行过程
    try {
      // 模拟执行时间
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟执行结果
      const outputData = {
        result: 'success',
        message: '工作流执行成功',
        timestamp: new Date().toISOString(),
        inputData: executeDto.inputData,
      };

      // 更新执行状态
      await this.prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'SUCCEEDED',
          finishedAt: new Date(),
          outputData,
          logs: [
            { level: 'info', message: '开始执行工作流', timestamp: execution.startedAt },
            { level: 'info', message: '工作流执行成功', timestamp: new Date() },
          ],
        },
      });

      return {
        executionId: execution.id,
        status: 'SUCCEEDED',
        outputData,
      };
    } catch (error) {
      // 执行失败，更新状态
      await this.prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          logs: [
            { level: 'info', message: '开始执行工作流', timestamp: execution.startedAt },
            { level: 'error', message: `执行失败: ${error.message}`, timestamp: new Date() },
          ],
        },
      });

      throw error;
    }
  }

  async getExecutions(workflowId: string, userId: string) {
    // 先检查工作流是否存在且属于当前用户
    await this.findOne(workflowId, userId);

    const executions = await this.prisma.execution.findMany({
      where: {
        workflowId,
        userId,
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 50, // 限制返回最近50次执行记录
    });

    return executions;
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Execution, ExecutionStatus } from './execution.entity';
import { CreateExecutionDto, UpdateExecutionDto } from './dto';

@Injectable()
export class ExecutionService {
  constructor(
    @InjectRepository(Execution)
    private executionRepository: Repository<Execution>,
  ) {}

  async create(createExecutionDto: CreateExecutionDto, userId: number): Promise<Execution> {
    const execution = this.executionRepository.create({
      ...createExecutionDto,
      userId,
      status: createExecutionDto.status || ExecutionStatus.PENDING,
    });

    return await this.executionRepository.save(execution);
  }

  async findAll(
    userId: number,
    page: number = 1,
    limit: number = 20,
    workflowId?: number,
    status?: ExecutionStatus,
  ): Promise<{ executions: Execution[]; total: number; page: number; limit: number }> {
    const options: FindManyOptions<Execution> = {
      where: {
        userId,
        ...(workflowId && { workflowId }),
        ...(status && { status }),
      },
      relations: ['workflow'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [executions, total] = await this.executionRepository.findAndCount(options);

    return {
      executions,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, userId: number): Promise<Execution> {
    const execution = await this.executionRepository.findOne({
      where: { id, userId },
      relations: ['workflow', 'user'],
    });

    if (!execution) {
      throw new NotFoundException(`Execution with ID ${id} not found`);
    }

    return execution;
  }

  async update(id: number, updateExecutionDto: UpdateExecutionDto, userId: number): Promise<Execution> {
    const execution = await this.findOne(id, userId);

    // 计算执行时长
    if (updateExecutionDto.finishedAt && execution.startedAt) {
      updateExecutionDto.duration = new Date(updateExecutionDto.finishedAt).getTime() - execution.startedAt.getTime();
    }

    Object.assign(execution, updateExecutionDto);
    return await this.executionRepository.save(execution);
  }

  async remove(id: number, userId: number): Promise<void> {
    const execution = await this.findOne(id, userId);
    await this.executionRepository.remove(execution);
  }

  async startExecution(id: number, userId: number): Promise<Execution> {
    const execution = await this.findOne(id, userId);

    if (execution.status !== ExecutionStatus.PENDING) {
      throw new BadRequestException('Execution is not in pending status');
    }

    return await this.update(id, {
      status: ExecutionStatus.RUNNING,
      startedAt: new Date(),
    }, userId);
  }

  async completeExecution(
    id: number,
    userId: number,
    status: ExecutionStatus.SUCCESS | ExecutionStatus.FAILED,
    outputData?: string,
    errorMessage?: string,
    logs?: string,
  ): Promise<Execution> {
    const execution = await this.findOne(id, userId);

    if (execution.status !== ExecutionStatus.RUNNING) {
      throw new BadRequestException('Execution is not in running status');
    }

    const finishedAt = new Date();
    const duration = execution.startedAt ? finishedAt.getTime() - execution.startedAt.getTime() : undefined;

    return await this.update(id, {
      status,
      outputData,
      errorMessage,
      logs,
      finishedAt,
      duration,
    }, userId);
  }

  async cancelExecution(id: number, userId: number): Promise<Execution> {
    const execution = await this.findOne(id, userId);

    if (![ExecutionStatus.PENDING, ExecutionStatus.RUNNING].includes(execution.status)) {
      throw new BadRequestException('Execution cannot be cancelled');
    }

    const finishedAt = new Date();
    const duration = execution.startedAt ? finishedAt.getTime() - execution.startedAt.getTime() : undefined;

    return await this.update(id, {
      status: ExecutionStatus.CANCELLED,
      finishedAt,
      duration,
    }, userId);
  }

  async getExecutionStats(userId: number, workflowId?: number): Promise<{
    total: number;
    success: number;
    failed: number;
    running: number;
    pending: number;
  }> {
    const baseWhere = {
      userId,
      ...(workflowId && { workflowId }),
    };

    const [total, success, failed, running, pending] = await Promise.all([
      this.executionRepository.count({ where: baseWhere }),
      this.executionRepository.count({ where: { ...baseWhere, status: ExecutionStatus.SUCCESS } }),
      this.executionRepository.count({ where: { ...baseWhere, status: ExecutionStatus.FAILED } }),
      this.executionRepository.count({ where: { ...baseWhere, status: ExecutionStatus.RUNNING } }),
      this.executionRepository.count({ where: { ...baseWhere, status: ExecutionStatus.PENDING } }),
    ]);

    return {
      total,
      success,
      failed,
      running,
      pending,
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto, UpdateExecutionDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionStatus } from './execution.entity';

@Controller('executions')
@UseGuards(JwtAuthGuard)
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  create(@Body() createExecutionDto: CreateExecutionDto, @Request() req) {
    return this.executionService.create(createExecutionDto, req.user.userId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: ExecutionStatus,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const workflowIdNum = workflowId ? parseInt(workflowId, 10) : undefined;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    return this.executionService.findAll(
      req.user.userId,
      pageNum,
      limitNum,
      workflowIdNum,
      status,
    );
  }

  @Get('stats')
  getStats(@Request() req, @Query('workflowId') workflowId?: string) {
    const workflowIdNum = workflowId ? parseInt(workflowId, 10) : undefined;
    return this.executionService.getExecutionStats(req.user.userId, workflowIdNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.executionService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExecutionDto: UpdateExecutionDto,
    @Request() req,
  ) {
    return this.executionService.update(id, updateExecutionDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.executionService.remove(id, req.user.userId);
  }

  @Post(':id/start')
  startExecution(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.executionService.startExecution(id, req.user.userId);
  }

  @Post(':id/complete')
  completeExecution(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      status: ExecutionStatus.SUCCESS | ExecutionStatus.FAILED;
      outputData?: string;
      errorMessage?: string;
      logs?: string;
    },
    @Request() req,
  ) {
    const { status, outputData, errorMessage, logs } = body;
    return this.executionService.completeExecution(
      id,
      req.user.userId,
      status,
      outputData,
      errorMessage,
      logs,
    );
  }

  @Post(':id/cancel')
  cancelExecution(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.executionService.cancelExecution(id, req.user.userId);
  }
}
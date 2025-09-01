import { api } from '../lib/api';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Execution {
  id: number;
  workflowId: number;
  userId: number;
  status: ExecutionStatus;
  inputData?: string;
  outputData?: string;
  errorMessage?: string;
  logs?: string;
  startedAt?: string;
  finishedAt?: string;
  duration?: number;
  triggerType?: string;
  createdAt: string;
  updatedAt: string;
  workflow?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    username: string;
  };
}

export interface CreateExecutionDto {
  workflowId: number;
  inputData?: string;
  status?: ExecutionStatus;
  triggerType?: string;
}

export interface UpdateExecutionDto {
  status?: ExecutionStatus;
  outputData?: string;
  errorMessage?: string;
  logs?: string;
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number;
}

export interface ExecutionListResponse {
  executions: Execution[];
  total: number;
  page: number;
  limit: number;
}

export interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  pending: number;
}

export interface CompleteExecutionDto {
  status: ExecutionStatus.SUCCESS | ExecutionStatus.FAILED;
  outputData?: string;
  errorMessage?: string;
  logs?: string;
}

export class ExecutionService {


  static async getAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      workflowId?: number;
      status?: ExecutionStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ExecutionListResponse> {
    const params = {
      page,
      limit,
      ...filters,
    };

    return api.get<ExecutionListResponse>('/executions', { params });
  }

  static async getById(id: number): Promise<Execution> {
    return api.get<Execution>(`/executions/${id}`);
  }

  static async create(data: CreateExecutionDto): Promise<Execution> {
    return api.post<Execution>('/executions', data);
  }

  static async update(id: number, data: UpdateExecutionDto): Promise<Execution> {
    return api.put<Execution>(`/executions/${id}`, data);
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/executions/${id}`);
  }

  static async start(id: number): Promise<Execution> {
    return api.post<Execution>(`/executions/${id}/start`);
  }

  static async complete(id: number, data: CompleteExecutionDto): Promise<Execution> {
    return api.post<Execution>(`/executions/${id}/complete`, data);
  }

  static async cancel(id: number): Promise<Execution> {
    return api.post<Execution>(`/executions/${id}/cancel`);
  }

  static async getStats(filters?: {
    workflowId?: number;
    status?: ExecutionStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<ExecutionStats> {
    return api.get<ExecutionStats>('/executions/stats', { params: filters });
  }
}
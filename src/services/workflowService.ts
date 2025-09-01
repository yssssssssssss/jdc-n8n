import { api } from "../lib/api";

export interface Workflow {
  id: string;
  name: string;
  definition: any;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowData {
  name: string;
  definition: any;
  isActive?: boolean;
}

export interface UpdateWorkflowData {
  name?: string;
  definition?: any;
  isActive?: boolean;
}

export interface QueryWorkflowParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface WorkflowListResponse {
  data: Workflow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExecuteWorkflowData {
  inputData?: any;
}

export interface ExecutionResult {
  executionId: string;
  status: string;
  outputData: any;
}

export interface Execution {
  id: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  inputData?: any;
  outputData?: any;
  logs: any[];
  workflowId: string;
  userId: string;
}

class WorkflowService {
  async getWorkflows(params?: QueryWorkflowParams): Promise<WorkflowListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const response = await api.get(`/workflows?${searchParams.toString()}`);
    return response.data;
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(data: CreateWorkflowData): Promise<Workflow> {
    const response = await api.post('/workflows', data);
    return response.data;
  }

  async updateWorkflow(id: string, data: UpdateWorkflowData): Promise<Workflow> {
    const response = await api.patch(`/workflows/${id}`, data);
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    await api.delete(`/workflows/${id}`);
  }

  async executeWorkflow(id: string, data?: ExecuteWorkflowData): Promise<ExecutionResult> {
    const response = await api.post(`/workflows/${id}/execute`, data || {});
    return response.data;
  }

  async getWorkflowExecutions(id: string): Promise<Execution[]> {
    const response = await api.get(`/workflows/${id}/executions`);
    return response.data;
  }

  async toggleWorkflowStatus(id: string, isActive: boolean): Promise<Workflow> {
    return this.updateWorkflow(id, { isActive });
  }
}

export const workflowService = new WorkflowService();
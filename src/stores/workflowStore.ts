import { create } from 'zustand';
import { 
  workflowService, 
  Workflow, 
  CreateWorkflowData, 
  UpdateWorkflowData, 
  QueryWorkflowParams,
  WorkflowListResponse,
  ExecuteWorkflowData,
  ExecutionResult,
  Execution
} from '../services/workflowService';
import { toast } from 'sonner';

interface WorkflowState {
  // 状态
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executions: Execution[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // 操作
  fetchWorkflows: (params?: QueryWorkflowParams) => Promise<void>;
  fetchWorkflow: (id: string) => Promise<void>;
  createWorkflow: (data: CreateWorkflowData) => Promise<Workflow | null>;
  updateWorkflow: (id: string, data: UpdateWorkflowData) => Promise<Workflow | null>;
  deleteWorkflow: (id: string) => Promise<boolean>;
  executeWorkflow: (id: string, data?: ExecuteWorkflowData) => Promise<ExecutionResult | null>;
  fetchWorkflowExecutions: (id: string) => Promise<void>;
  toggleWorkflowStatus: (id: string, isActive: boolean) => Promise<boolean>;
  
  // 重置状态
  resetCurrentWorkflow: () => void;
  resetExecutions: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // 初始状态
  workflows: [],
  currentWorkflow: null,
  executions: [],
  loading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // 获取工作流列表
  fetchWorkflows: async (params?: QueryWorkflowParams) => {
    set({ loading: true });
    try {
      const response: WorkflowListResponse = await workflowService.getWorkflows(params);
      set({ 
        workflows: response.data, 
        pagination: response.pagination,
        loading: false 
      });
    } catch (error: any) {
      console.error('获取工作流列表失败:', error);
      toast.error('获取工作流列表失败');
      set({ loading: false });
    }
  },

  // 获取单个工作流
  fetchWorkflow: async (id: string) => {
    set({ loading: true });
    try {
      const workflow = await workflowService.getWorkflow(id);
      set({ currentWorkflow: workflow, loading: false });
    } catch (error: any) {
      console.error('获取工作流详情失败:', error);
      toast.error('获取工作流详情失败');
      set({ loading: false });
    }
  },

  // 创建工作流
  createWorkflow: async (data: CreateWorkflowData) => {
    set({ loading: true });
    try {
      const workflow = await workflowService.createWorkflow(data);
      const { workflows } = get();
      set({ 
        workflows: [workflow, ...workflows],
        loading: false 
      });
      toast.success('工作流创建成功');
      return workflow;
    } catch (error: any) {
      console.error('创建工作流失败:', error);
      toast.error('创建工作流失败');
      set({ loading: false });
      return null;
    }
  },

  // 更新工作流
  updateWorkflow: async (id: string, data: UpdateWorkflowData) => {
    set({ loading: true });
    try {
      const updatedWorkflow = await workflowService.updateWorkflow(id, data);
      const { workflows, currentWorkflow } = get();
      
      // 更新列表中的工作流
      const updatedWorkflows = workflows.map(w => 
        w.id === id ? updatedWorkflow : w
      );
      
      set({ 
        workflows: updatedWorkflows,
        currentWorkflow: currentWorkflow?.id === id ? updatedWorkflow : currentWorkflow,
        loading: false 
      });
      
      toast.success('工作流更新成功');
      return updatedWorkflow;
    } catch (error: any) {
      console.error('更新工作流失败:', error);
      toast.error('更新工作流失败');
      set({ loading: false });
      return null;
    }
  },

  // 删除工作流
  deleteWorkflow: async (id: string) => {
    set({ loading: true });
    try {
      await workflowService.deleteWorkflow(id);
      const { workflows, currentWorkflow } = get();
      
      const updatedWorkflows = workflows.filter(w => w.id !== id);
      set({ 
        workflows: updatedWorkflows,
        currentWorkflow: currentWorkflow?.id === id ? null : currentWorkflow,
        loading: false 
      });
      
      toast.success('工作流删除成功');
      return true;
    } catch (error: any) {
      console.error('删除工作流失败:', error);
      toast.error('删除工作流失败');
      set({ loading: false });
      return false;
    }
  },

  // 执行工作流
  executeWorkflow: async (id: string, data?: ExecuteWorkflowData) => {
    set({ loading: true });
    try {
      const result = await workflowService.executeWorkflow(id, data);
      set({ loading: false });
      toast.success('工作流执行成功');
      return result;
    } catch (error: any) {
      console.error('执行工作流失败:', error);
      toast.error('执行工作流失败');
      set({ loading: false });
      return null;
    }
  },

  // 获取工作流执行历史
  fetchWorkflowExecutions: async (id: string) => {
    set({ loading: true });
    try {
      const executions = await workflowService.getWorkflowExecutions(id);
      set({ executions, loading: false });
    } catch (error: any) {
      console.error('获取执行历史失败:', error);
      toast.error('获取执行历史失败');
      set({ loading: false });
    }
  },

  // 切换工作流状态
  toggleWorkflowStatus: async (id: string, isActive: boolean) => {
    try {
      const updatedWorkflow = await workflowService.toggleWorkflowStatus(id, isActive);
      const { workflows, currentWorkflow } = get();
      
      const updatedWorkflows = workflows.map(w => 
        w.id === id ? updatedWorkflow : w
      );
      
      set({ 
        workflows: updatedWorkflows,
        currentWorkflow: currentWorkflow?.id === id ? updatedWorkflow : currentWorkflow,
      });
      
      toast.success(`工作流已${isActive ? '激活' : '停用'}`);
      return true;
    } catch (error: any) {
      console.error('切换工作流状态失败:', error);
      toast.error('切换工作流状态失败');
      return false;
    }
  },

  // 重置当前工作流
  resetCurrentWorkflow: () => {
    set({ currentWorkflow: null });
  },

  // 重置执行历史
  resetExecutions: () => {
    set({ executions: [] });
  },
}));
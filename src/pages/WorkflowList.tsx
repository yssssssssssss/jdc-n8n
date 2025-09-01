import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../stores/workflowStore';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const WorkflowList: React.FC = () => {
  const navigate = useNavigate();
  const {
    workflows,
    loading,
    pagination,
    fetchWorkflows,
    deleteWorkflow,
    toggleWorkflowStatus,
    executeWorkflow
  } = useWorkflowStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active'
    };
    await fetchWorkflows(params);
  };

  const handleSearch = () => {
    loadWorkflows();
  };

  const handleCreateWorkflow = () => {
    navigate('/workflows/new');
  };

  const handleEditWorkflow = (id: string) => {
    navigate(`/workflows/${id}/edit`);
  };

  const handleDeleteWorkflow = async (id: string) => {
    const success = await deleteWorkflow(id);
    if (success) {
      setShowDeleteModal(null);
      loadWorkflows();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleWorkflowStatus(id, !currentStatus);
  };

  const handleExecuteWorkflow = async (id: string) => {
    setExecutingWorkflow(id);
    try {
      const result = await executeWorkflow(id);
      if (result) {
        toast.success(`工作流执行成功，执行ID: ${result.executionId}`);
      }
    } finally {
      setExecutingWorkflow(null);
    }
  };

  const handleViewExecutions = (id: string) => {
    navigate(`/workflows/${id}/executions`);
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题和操作栏 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">工作流管理</h1>
              <p className="text-gray-600 mt-2">创建和管理您的自动化工作流</p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建工作流
            </button>
          </div>

          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索工作流..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="active">已激活</option>
                <option value="inactive">已停用</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* 工作流列表 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无工作流</h3>
            <p className="text-gray-600 mb-6">开始创建您的第一个自动化工作流</p>
            <button
              onClick={handleCreateWorkflow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建工作流
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工作流名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {workflow.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {workflow.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(workflow.isActive)}
                          <span className={`text-sm ${
                            workflow.isActive ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {workflow.isActive ? '已激活' : '已停用'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(workflow.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(workflow.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* 执行按钮 */}
                          <button
                            onClick={() => handleExecuteWorkflow(workflow.id)}
                            disabled={!workflow.isActive || executingWorkflow === workflow.id}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            title="执行工作流"
                          >
                            {executingWorkflow === workflow.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* 启用/停用按钮 */}
                          <button
                            onClick={() => handleToggleStatus(workflow.id, workflow.isActive)}
                            className={`${
                              workflow.isActive 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={workflow.isActive ? '停用工作流' : '激活工作流'}
                          >
                            {workflow.isActive ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* 编辑按钮 */}
                          <button
                            onClick={() => handleEditWorkflow(workflow.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="编辑工作流"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {/* 查看执行历史 */}
                          <button
                            onClick={() => handleViewExecutions(workflow.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="查看执行历史"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          
                          {/* 删除按钮 */}
                          <button
                            onClick={() => setShowDeleteModal(workflow.id)}
                            className="text-red-600 hover:text-red-900"
                            title="删除工作流"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示第 {(pagination.page - 1) * pagination.limit + 1} 到{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                    共 {pagination.total} 条记录
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchWorkflows({ ...{ search: searchTerm, isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' }, page: pagination.page - 1 })}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchWorkflows({ ...{ search: searchTerm, isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' }, page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              您确定要删除这个工作流吗？此操作无法撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => showDeleteModal && handleDeleteWorkflow(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
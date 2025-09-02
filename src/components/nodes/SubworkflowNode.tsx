import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  PlayArrow,
  Stop,
  Edit,
  Visibility,
  Inventory,
  Input,
  Output,
  Settings,
  BugReport,
} from '@mui/icons-material';
import { Handle, Position, NodeProps } from 'reactflow';
import { AdvancedNode, AdvancedNodeData, AdvancedPort } from './AdvancedNode';
import { SubworkflowDefinition } from '../SubworkflowManager';

// 子流程节点数据接口
export interface SubworkflowNodeData extends AdvancedNodeData {
  subworkflowId: string;
  subworkflowDefinition: SubworkflowDefinition;
  instanceParameters: Record<string, any>; // 实例化参数
  executionMode: 'sync' | 'async'; // 执行模式
  debugMode: boolean; // 调试模式
  isolationLevel: 'none' | 'partial' | 'full'; // 隔离级别
  errorHandling: {
    onError: 'stop' | 'continue' | 'retry';
    maxRetries: number;
    retryDelay: number;
  };
  monitoring: {
    enableMetrics: boolean;
    enableLogs: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

// 子流程执行状态
interface SubworkflowExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  progress: number;
  currentStep: string;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  metrics: {
    nodesExecuted: number;
    totalNodes: number;
    executionTime: number;
    memoryUsage: number;
  };
  logs: Array<{
    timestamp: Date;
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    nodeId?: string;
  }>;
}

interface SubworkflowNodeProps extends NodeProps {
  data: SubworkflowNodeData;
}

const SubworkflowNode: React.FC<SubworkflowNodeProps> = ({ data, selected }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [executionState, setExecutionState] = useState<SubworkflowExecutionState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    metrics: {
      nodesExecuted: 0,
      totalNodes: data.subworkflowDefinition.nodes.length,
      executionTime: 0,
      memoryUsage: 0,
    },
    logs: [],
  });

  // 获取状态颜色
  const getStatusColor = () => {
    switch (executionState.status) {
      case 'running': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'error': return '#f44336';
      case 'paused': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (executionState.status) {
      case 'running': return <PlayArrow />;
      case 'completed': return <PlayArrow />;
      case 'error': return <BugReport />;
      case 'paused': return <Stop />;
      default: return <Inventory />;
    }
  };

  // 执行子流程
  const executeSubworkflow = useCallback(async () => {
    setExecutionState(prev => ({
      ...prev,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      logs: [...prev.logs, {
        timestamp: new Date(),
        level: 'info',
        message: `开始执行子流程: ${data.subworkflowDefinition.name}`,
      }],
    }));

    try {
      // 模拟子流程执行
      const totalSteps = data.subworkflowDefinition.nodes.length;
      
      for (let i = 0; i < totalSteps; i++) {
        const node = data.subworkflowDefinition.nodes[i];
        
        setExecutionState(prev => ({
          ...prev,
          progress: ((i + 1) / totalSteps) * 100,
          currentStep: node.data.label || `节点 ${i + 1}`,
          metrics: {
            ...prev.metrics,
            nodesExecuted: i + 1,
          },
          logs: [...prev.logs, {
            timestamp: new Date(),
            level: 'info',
            message: `执行节点: ${node.data.label || node.id}`,
            nodeId: node.id,
          }],
        }));
        
        // 模拟节点执行时间
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setExecutionState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        currentStep: '执行完成',
        logs: [...prev.logs, {
          timestamp: new Date(),
          level: 'info',
          message: `子流程执行完成: ${data.subworkflowDefinition.name}`,
        }],
      }));
    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        status: 'error',
        endTime: new Date(),
        error: error instanceof Error ? error.message : '未知错误',
        logs: [...prev.logs, {
          timestamp: new Date(),
          level: 'error',
          message: `子流程执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
        }],
      }));
    }
  }, [data.subworkflowDefinition]);

  // 停止执行
  const stopExecution = useCallback(() => {
    setExecutionState(prev => ({
      ...prev,
      status: 'paused',
      logs: [...prev.logs, {
        timestamp: new Date(),
        level: 'warn',
        message: '子流程执行已停止',
      }],
    }));
  }, []);

  // 重置状态
  const resetExecution = useCallback(() => {
    setExecutionState({
      status: 'idle',
      progress: 0,
      currentStep: '',
      metrics: {
        nodesExecuted: 0,
        totalNodes: data.subworkflowDefinition.nodes.length,
        executionTime: 0,
        memoryUsage: 0,
      },
      logs: [],
    });
  }, [data.subworkflowDefinition.nodes.length]);

  return (
    <Box
      sx={{
        minWidth: 280,
        maxWidth: 400,
        border: `2px solid ${selected ? '#1976d2' : getStatusColor()}`,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: selected ? '0 0 10px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 输入端口 */}
      {data.subworkflowDefinition.inputPorts.map((port, index) => (
        <Handle
          key={port.id}
          type="target"
          position={Position.Left}
          id={port.id}
          style={{
            top: `${20 + (index * 25)}px`,
            backgroundColor: '#2196f3',
            width: 12,
            height: 12,
          }}
        />
      ))}

      {/* 输出端口 */}
      {data.subworkflowDefinition.outputPorts.map((port, index) => (
        <Handle
          key={port.id}
          type="source"
          position={Position.Right}
          id={port.id}
          style={{
            top: `${20 + (index * 25)}px`,
            backgroundColor: '#4caf50',
            width: 12,
            height: 12,
          }}
        />
      ))}

      {/* 头部 */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: getStatusColor(),
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="subtitle2" fontWeight="bold">
            {data.subworkflowDefinition.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={data.subworkflowDefinition.version}
            size="small"
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }}
          />
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ color: 'white' }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ p: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {data.subworkflowDefinition.description}
        </Typography>
        
        {/* 执行状态 */}
        {executionState.status !== 'idle' && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {executionState.currentStep}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(executionState.progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={executionState.progress}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}
        
        {/* 统计信息 */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<Input />}
            label={`${data.subworkflowDefinition.inputPorts.length} 输入`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Output />}
            label={`${data.subworkflowDefinition.outputPorts.length} 输出`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${data.subworkflowDefinition.nodes.length} 节点`}
            size="small"
            variant="outlined"
          />
        </Box>
        
        {/* 执行控制 */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {executionState.status === 'idle' || executionState.status === 'completed' || executionState.status === 'error' ? (
            <Button
              size="small"
              startIcon={<PlayArrow />}
              onClick={executeSubworkflow}
              variant="outlined"
              fullWidth
            >
              执行
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<Stop />}
              onClick={stopExecution}
              variant="outlined"
              color="warning"
              fullWidth
            >
              停止
            </Button>
          )}
        </Box>
        
        {/* 错误信息 */}
        {executionState.status === 'error' && executionState.error && (
          <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
            {executionState.error}
          </Alert>
        )}
      </Box>

      {/* 上下文菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setShowDetails(true); setAnchorEl(null); }}>
          <Visibility sx={{ mr: 1 }} /> 查看详情
        </MenuItem>
        <MenuItem onClick={() => { setShowLogs(true); setAnchorEl(null); }}>
          <BugReport sx={{ mr: 1 }} /> 查看日志
        </MenuItem>
        <MenuItem onClick={() => { resetExecution(); setAnchorEl(null); }}>
          <Settings sx={{ mr: 1 }} /> 重置状态
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Edit sx={{ mr: 1 }} /> 编辑子流程
        </MenuItem>
      </Menu>

      {/* 详情对话框 */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>子流程详情 - {data.subworkflowDefinition.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h6">基本信息</Typography>
              <Typography><strong>版本：</strong>{data.subworkflowDefinition.version}</Typography>
              <Typography><strong>类别：</strong>{data.subworkflowDefinition.category}</Typography>
              <Typography><strong>作者：</strong>{data.subworkflowDefinition.metadata.author}</Typography>
              <Typography><strong>创建时间：</strong>{data.subworkflowDefinition.metadata.createdAt.toLocaleString()}</Typography>
            </Box>
            
            <Box>
              <Typography variant="h6">执行统计</Typography>
              <Typography><strong>节点数量：</strong>{executionState.metrics.totalNodes}</Typography>
              <Typography><strong>已执行：</strong>{executionState.metrics.nodesExecuted}</Typography>
              <Typography><strong>执行时间：</strong>{executionState.metrics.executionTime}ms</Typography>
              <Typography><strong>内存使用：</strong>{executionState.metrics.memoryUsage}MB</Typography>
            </Box>
            
            <Box>
              <Typography variant="h6">端口配置</Typography>
              <Typography><strong>输入端口：</strong></Typography>
              {data.subworkflowDefinition.inputPorts.map(port => (
                <Typography key={port.id} sx={{ ml: 2 }}>• {port.name} ({port.type})</Typography>
              ))}
              <Typography><strong>输出端口：</strong></Typography>
              {data.subworkflowDefinition.outputPorts.map(port => (
                <Typography key={port.id} sx={{ ml: 2 }}>• {port.name} ({port.type})</Typography>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 日志对话框 */}
      <Dialog open={showLogs} onClose={() => setShowLogs(false)} maxWidth="lg" fullWidth>
        <DialogTitle>执行日志 - {data.subworkflowDefinition.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {executionState.logs.length === 0 ? (
              <Typography color="text.secondary">暂无日志</Typography>
            ) : (
              executionState.logs.map((log, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {log.timestamp.toLocaleTimeString()} [{log.level.toUpperCase()}]
                    {log.nodeId && ` [${log.nodeId}]`}
                  </Typography>
                  <Typography variant="body2">{log.message}</Typography>
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogs(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubworkflowNode;
export type { SubworkflowNodeData, SubworkflowExecutionState };
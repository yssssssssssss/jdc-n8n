import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Switch, 
  FormControlLabel, 
  Slider, 
  Button, 
  Collapse, 
  Divider 
} from '@mui/material';
import { Settings, ExpandMore, ExpandLess } from '@mui/icons-material';

// 高级参数类型定义
export interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'slider' | 'color' | 'file' | 'json' | 'group';
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{ value: any; label: string; disabled?: boolean }>;
  };
  conditional?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  };
  children?: ParameterSchema[]; // 用于group类型的嵌套参数
}

// 端口类型定义
export interface AdvancedPort {
  id: string;
  name: string;
  type: 'data' | 'control' | 'image' | 'text' | 'number' | 'boolean' | 'model' | 'latent' | 'conditioning';
  required?: boolean;
  multiple?: boolean; // 是否支持多连接
  description?: string;
}

// 节点执行状态
export interface NodeExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  progress?: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
  executionId?: string;
}

// 高级节点数据接口
export interface AdvancedNodeData {
  // 基础属性
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  version: string;
  
  // 端口配置
  inputs: AdvancedPort[];
  outputs: AdvancedPort[];
  
  // 参数配置
  parameters: ParameterSchema[];
  parameterValues: Record<string, any>;
  
  // 执行配置
  executionConfig: {
    timeout?: number;
    retryCount?: number;
    cacheEnabled?: boolean;
    parallelExecution?: boolean;
  };
  
  // 运行时状态
  executionState?: NodeExecutionState;
  
  // 子流程配置（用于复合节点）
  subworkflow?: {
    nodes: any[];
    edges: any[];
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
  };
  
  // 模板配置
  template?: {
    isTemplate: boolean;
    templateId?: string;
    templateName?: string;
    templateDescription?: string;
  };
  
  // 自定义渲染
  customRenderer?: {
    component?: React.ComponentType<any>;
    width?: number;
    height?: number;
    resizable?: boolean;
  };
}

interface AdvancedNodeProps {
  data: AdvancedNodeData;
  selected?: boolean;
  id: string;
}

const AdvancedNode: React.FC<AdvancedNodeProps> = ({ data, selected, id }) => {
  const [expanded, setExpanded] = useState(false);
  const [parameterValues, setParameterValues] = useState(data.parameterValues || {});

  const updateParameterValue = (paramName: string, value: any) => {
    const newValues = { ...parameterValues, [paramName]: value };
    setParameterValues(newValues);
    // 这里可以添加回调来更新父组件的数据
  };

  const renderParameterControl = (param: ParameterSchema) => {
    const value = parameterValues[param.name] ?? param.defaultValue;
    
    // 检查条件显示
    if (param.conditional) {
      const dependentValue = parameterValues[param.conditional.dependsOn];
      const shouldShow = (() => {
        switch (param.conditional.condition) {
          case 'equals': return dependentValue === param.conditional.value;
          case 'not_equals': return dependentValue !== param.conditional.value;
          case 'greater_than': return dependentValue > param.conditional.value;
          case 'less_than': return dependentValue < param.conditional.value;
          case 'contains': return String(dependentValue).includes(param.conditional.value);
          default: return true;
        }
      })();
      if (!shouldShow) return null;
    }

    const commonProps = {
      size: 'small' as const,
      fullWidth: true,
      sx: { mb: 1 }
    };

    switch (param.type) {
      case 'string':
        return (
          <TextField
            key={param.name}
            label={param.label}
            value={value || ''}
            onChange={(e) => updateParameterValue(param.name, e.target.value)}
            placeholder={param.description}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <TextField
            key={param.name}
            label={param.label}
            type="number"
            value={value || ''}
            onChange={(e) => updateParameterValue(param.name, parseFloat(e.target.value) || 0)}
            inputProps={{
              min: param.validation?.min,
              max: param.validation?.max
            }}
            {...commonProps}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={param.name}
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => updateParameterValue(param.name, e.target.checked)}
                size="small"
              />
            }
            label={param.label}
            sx={{ mb: 1, width: '100%' }}
          />
        );

      case 'select':
        return (
          <FormControl key={param.name} {...commonProps}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value || ''}
              label={param.label}
              onChange={(e) => updateParameterValue(param.name, e.target.value)}
            >
              {param.validation?.options?.map((option) => (
                <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'slider':
        return (
          <Box key={param.name} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {param.label}: {value}
            </Typography>
            <Slider
              value={value || param.validation?.min || 0}
              onChange={(_, newValue) => updateParameterValue(param.name, newValue)}
              min={param.validation?.min || 0}
              max={param.validation?.max || 100}
              step={0.1}
              size="small"
            />
          </Box>
        );

      case 'group':
        return (
          <Box key={param.name} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {param.label}
            </Typography>
            <Box sx={{ pl: 1, borderLeft: '2px solid #e0e0e0' }}>
              {param.children?.map(childParam => renderParameterControl(childParam))}
            </Box>
          </Box>
        );

      default:
        return (
          <TextField
            key={param.name}
            label={param.label}
            value={value || ''}
            onChange={(e) => updateParameterValue(param.name, e.target.value)}
            {...commonProps}
          />
        );
    }
  };

  const getPortColor = (type: string) => {
    const colors = {
      data: '#64b5f6',
      control: '#81c784',
      image: '#ffb74d',
      text: '#f06292',
      number: '#9575cd',
      boolean: '#4db6ac',
      model: '#ff8a65',
      latent: '#a1887f',
      conditioning: '#90a4ae'
    };
    return colors[type as keyof typeof colors] || '#bdbdbd';
  };

  const getStatusColor = () => {
    if (!data.executionState) return data.color;
    
    switch (data.executionState.status) {
      case 'running': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'error': return '#f44336';
      case 'paused': return '#ff9800';
      default: return data.color;
    }
  };

  const renderProgressBar = () => {
    if (!data.executionState || data.executionState.status !== 'running') return null;
    
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            height: '100%',
            backgroundColor: '#2196f3',
            width: `${data.executionState.progress || 0}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minWidth: data.customRenderer?.width || 280,
        minHeight: data.customRenderer?.height || (expanded ? 400 : 120),
        maxWidth: 400,
        backgroundColor: 'white',
        border: `2px solid ${selected ? '#1976d2' : getStatusColor()}`,
        borderRadius: 2,
        position: 'relative',
        boxShadow: selected ? '0 4px 20px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        resize: data.customRenderer?.resizable ? 'both' : 'none',
        overflow: 'hidden'
      }}
    >
      {/* 输入端口 */}
      {data.inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            top: `${((index + 1) / (data.inputs.length + 1)) * 100}%`,
            backgroundColor: getPortColor(input.type),
            border: '2px solid white',
            width: 12,
            height: 12
          }}
        />
      ))}

      {/* 输出端口 */}
      {data.outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            top: `${((index + 1) / (data.outputs.length + 1)) * 100}%`,
            backgroundColor: getPortColor(output.type),
            border: '2px solid white',
            width: 12,
            height: 12
          }}
        />
      ))}

      {/* 节点头部 */}
      <Box
        sx={{
          backgroundColor: getStatusColor(),
          color: 'white',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '6px 6px 0 0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {data.icon}
          <Typography variant="body2" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {data.executionState && (
            <Chip
              label={data.executionState.status}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            />
          )}
          <IconButton size="small" sx={{ color: 'white', p: 0.5 }}>
            <Settings fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 节点内容 */}
      <Box sx={{ p: 1.5 }}>
        {data.customRenderer?.component ? (
          <data.customRenderer.component data={data} nodeId={id} />
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {data.description}
            </Typography>
            
            {/* 参数配置区域 */}
            {data.parameters && data.parameters.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    参数配置
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setExpanded(!expanded)}
                    sx={{ p: 0.5 }}
                  >
                    {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </IconButton>
                </Box>
                
                <Collapse in={expanded}>
                  <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                    {data.parameters.map((param) => renderParameterControl(param))}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Collapse>
                
                {/* 显示关键参数摘要（当收起时） */}
                {!expanded && (
                  <Box sx={{ mb: 1 }}>
                    {data.parameters.slice(0, 2).map((param) => {
                      const value = parameterValues[param.name] ?? param.defaultValue;
                      if (value === undefined || value === '') return null;
                      
                      return (
                        <Box key={param.name} sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {param.label}:
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                            {typeof value === 'object' ? JSON.stringify(value).slice(0, 15) + '...' : String(value).slice(0, 15)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
            
            {/* 版本和类别信息 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Chip label={data.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
              <Typography variant="caption" color="text.secondary">
                v{data.version}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* 进度条 */}
      {renderProgressBar()}
      
      {/* 子流程指示器 */}
      {data.subworkflow && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 16,
            height: 16,
            backgroundColor: '#ff9800',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          S
        </Box>
      )}
      
      {/* 模板指示器 */}
      {data.template?.isTemplate && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            left: -8,
            width: 16,
            height: 16,
            backgroundColor: '#9c27b0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          T
        </Box>
      )}
    </Box>
  );
};

export default AdvancedNode;
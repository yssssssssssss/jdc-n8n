import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  Paper,
  Divider,
  FormHelperText,
  Autocomplete,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Delete,
  Info,
  Refresh,
  Save,
  Upload,
  Download,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { ColorPicker } from '@mui/x-date-pickers';
import { AdvancedNodeData, ParameterSchema } from './nodes/AdvancedNode';

interface AdvancedNodePropertiesProps {
  nodeData: AdvancedNodeData;
  onUpdateNode: (nodeId: string, data: AdvancedNodeData) => void;
  nodeId: string;
}

const AdvancedNodeProperties: React.FC<AdvancedNodePropertiesProps> = ({
  nodeData,
  onUpdateNode,
  nodeId,
}) => {
  const [parameterValues, setParameterValues] = useState(nodeData.parameterValues || {});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 检查参数是否应该显示（基于条件逻辑）
  const shouldShowParameter = (param: ParameterSchema): boolean => {
    if (!param.conditional) return true;
    
    const dependentValue = parameterValues[param.conditional.dependsOn];
    const conditionValue = param.conditional.value;
    
    switch (param.conditional.condition) {
      case 'equals':
        return dependentValue === conditionValue;
      case 'not_equals':
        return dependentValue !== conditionValue;
      case 'greater_than':
        return Number(dependentValue) > Number(conditionValue);
      case 'less_than':
        return Number(dependentValue) < Number(conditionValue);
      case 'contains':
        return String(dependentValue).includes(String(conditionValue));
      default:
        return true;
    }
  };

  // 验证参数值
  const validateParameter = (param: ParameterSchema, value: any): string | null => {
    if (param.required && (value === undefined || value === null || value === '')) {
      return `${param.label}是必填项`;
    }
    
    if (param.validation) {
      const { min, max, pattern, options } = param.validation;
      
      if (param.type === 'number') {
        const numValue = Number(value);
        if (min !== undefined && numValue < min) {
          return `${param.label}不能小于${min}`;
        }
        if (max !== undefined && numValue > max) {
          return `${param.label}不能大于${max}`;
        }
      }
      
      if (param.type === 'string' && pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(String(value))) {
          return `${param.label}格式不正确`;
        }
      }
      
      if (param.type === 'select' && options) {
        const validValues = options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          return `${param.label}值无效`;
        }
      }
    }
    
    return null;
  };

  // 更新参数值
  const updateParameterValue = (paramName: string, value: any) => {
    const newValues = { ...parameterValues, [paramName]: value };
    setParameterValues(newValues);
    
    // 验证当前参数
    const param = findParameterByName(paramName);
    if (param) {
      const error = validateParameter(param, value);
      setValidationErrors(prev => ({
        ...prev,
        [paramName]: error || ''
      }));
    }
    
    // 更新节点数据
    const updatedNodeData = {
      ...nodeData,
      parameterValues: newValues
    };
    onUpdateNode(nodeId, updatedNodeData);
  };

  // 查找参数定义
  const findParameterByName = (name: string): ParameterSchema | null => {
    const findInParams = (params: ParameterSchema[]): ParameterSchema | null => {
      for (const param of params) {
        if (param.name === name) return param;
        if (param.children) {
          const found = findInParams(param.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInParams(nodeData.parameters);
  };

  // 渲染不同类型的参数控件
  const renderParameterControl = (param: ParameterSchema, level: number = 0) => {
    if (!shouldShowParameter(param)) return null;
    
    const value = parameterValues[param.name] ?? param.defaultValue;
    const error = validationErrors[param.name];
    const indent = level * 16;
    
    const commonProps = {
      fullWidth: true,
      size: 'small' as const,
      error: !!error,
      helperText: error || param.description,
      sx: { ml: `${indent}px`, mb: 2 }
    };

    switch (param.type) {
      case 'string':
        return (
          <TextField
            key={param.name}
            label={param.label}
            value={value || ''}
            onChange={(e) => updateParameterValue(param.name, e.target.value)}
            multiline={param.name.includes('prompt') || param.name.includes('description')}
            rows={param.name.includes('prompt') ? 3 : 1}
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
            onChange={(e) => updateParameterValue(param.name, Number(e.target.value))}
            inputProps={{
              min: param.validation?.min,
              max: param.validation?.max
            }}
            {...commonProps}
          />
        );
        
      case 'boolean':
        return (
          <Box key={param.name} sx={{ ml: `${indent}px`, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value || false}
                  onChange={(e) => updateParameterValue(param.name, e.target.checked)}
                />
              }
              label={param.label}
            />
            {param.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {param.description}
              </Typography>
            )}
          </Box>
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
            {(error || param.description) && (
              <FormHelperText error={!!error}>
                {error || param.description}
              </FormHelperText>
            )}
          </FormControl>
        );
        
      case 'multiselect':
        return (
          <FormControl key={param.name} {...commonProps}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              multiple
              value={value || []}
              label={param.label}
              onChange={(e) => updateParameterValue(param.name, e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((val) => {
                    const option = param.validation?.options?.find(opt => opt.value === val);
                    return <Chip key={val} label={option?.label || val} size="small" />;
                  })}
                </Box>
              )}
            >
              {param.validation?.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={(value || []).includes(option.value)} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
            {(error || param.description) && (
              <FormHelperText error={!!error}>
                {error || param.description}
              </FormHelperText>
            )}
          </FormControl>
        );
        
      case 'slider':
        return (
          <Box key={param.name} sx={{ ml: `${indent}px`, mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              {param.label}: {value}
            </Typography>
            <Slider
              value={value || param.defaultValue || 0}
              onChange={(_, newValue) => updateParameterValue(param.name, newValue)}
              min={param.validation?.min || 0}
              max={param.validation?.max || 100}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
            {param.description && (
              <Typography variant="caption" color="text.secondary">
                {param.description}
              </Typography>
            )}
          </Box>
        );
        
      case 'color':
        return (
          <Box key={param.name} sx={{ ml: `${indent}px`, mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {param.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => updateParameterValue(param.name, e.target.value)}
                style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
              />
              <TextField
                value={value || '#000000'}
                onChange={(e) => updateParameterValue(param.name, e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            {param.description && (
              <Typography variant="caption" color="text.secondary">
                {param.description}
              </Typography>
            )}
          </Box>
        );
        
      case 'json':
        return (
          <TextField
            key={param.name}
            label={param.label}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateParameterValue(param.name, parsed);
              } catch {
                updateParameterValue(param.name, e.target.value);
              }
            }}
            multiline
            rows={4}
            {...commonProps}
          />
        );
        
      case 'file':
        return (
          <Box key={param.name} sx={{ ml: `${indent}px`, mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {param.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                size="small"
              >
                选择文件
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      updateParameterValue(param.name, {
                        name: file.name,
                        size: file.size,
                        type: file.type
                      });
                    }
                  }}
                />
              </Button>
              {value && (
                <Chip
                  label={value.name || '已选择文件'}
                  size="small"
                  onDelete={() => updateParameterValue(param.name, null)}
                />
              )}
            </Box>
            {param.description && (
              <Typography variant="caption" color="text.secondary">
                {param.description}
              </Typography>
            )}
          </Box>
        );
        
      case 'group':
        const isExpanded = expandedGroups[param.name] ?? true;
        return (
          <Accordion
            key={param.name}
            expanded={isExpanded}
            onChange={() => setExpandedGroups(prev => ({
              ...prev,
              [param.name]: !isExpanded
            }))}
            sx={{ ml: `${indent}px`, mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">{param.label}</Typography>
              {param.description && (
                <Tooltip title={param.description}>
                  <Info sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              )}
            </AccordionSummary>
            <AccordionDetails>
              {param.children?.map(child => renderParameterControl(child, level + 1))}
            </AccordionDetails>
          </Accordion>
        );
        
      default:
        return null;
    }
  };

  // 导出配置
  const exportConfig = () => {
    const config = {
      nodeType: nodeData.label,
      version: nodeData.version,
      parameters: parameterValues,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nodeData.label}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入配置
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.parameters) {
          setParameterValues(config.parameters);
          const updatedNodeData = {
            ...nodeData,
            parameterValues: config.parameters
          };
          onUpdateNode(nodeId, updatedNodeData);
        }
      } catch (error) {
        console.error('配置文件格式错误:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      {/* 节点基本信息 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {nodeData.icon}
          <Typography variant="h6">{nodeData.label}</Typography>
          <Chip label={`v${nodeData.version}`} size="small" />
          <Chip label={nodeData.category} size="small" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {nodeData.description}
        </Typography>
      </Paper>

      {/* 配置操作 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          startIcon={<Save />}
          onClick={exportConfig}
          size="small"
          variant="outlined"
        >
          导出配置
        </Button>
        <Button
          startIcon={<Upload />}
          component="label"
          size="small"
          variant="outlined"
        >
          导入配置
          <input type="file" hidden accept=".json" onChange={importConfig} />
        </Button>
        <Button
          startIcon={showAdvanced ? <VisibilityOff /> : <Visibility />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="small"
          variant="outlined"
        >
          {showAdvanced ? '隐藏高级' : '显示高级'}
        </Button>
      </Box>

      {/* 参数配置 */}
      <Box>
        {nodeData.parameters.map(param => renderParameterControl(param))}
      </Box>

      {/* 执行配置 */}
      {showAdvanced && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">执行配置</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="超时时间(毫秒)"
              type="number"
              value={nodeData.executionConfig.timeout || 30000}
              onChange={(e) => {
                const updatedNodeData = {
                  ...nodeData,
                  executionConfig: {
                    ...nodeData.executionConfig,
                    timeout: Number(e.target.value)
                  }
                };
                onUpdateNode(nodeId, updatedNodeData);
              }}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="重试次数"
              type="number"
              value={nodeData.executionConfig.retryCount || 0}
              onChange={(e) => {
                const updatedNodeData = {
                  ...nodeData,
                  executionConfig: {
                    ...nodeData.executionConfig,
                    retryCount: Number(e.target.value)
                  }
                };
                onUpdateNode(nodeId, updatedNodeData);
              }}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={nodeData.executionConfig.cacheEnabled || false}
                  onChange={(e) => {
                    const updatedNodeData = {
                      ...nodeData,
                      executionConfig: {
                        ...nodeData.executionConfig,
                        cacheEnabled: e.target.checked
                      }
                    };
                    onUpdateNode(nodeId, updatedNodeData);
                  }}
                />
              }
              label="启用缓存"
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* 验证错误提示 */}
      {Object.values(validationErrors).some(error => error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">请修正以下错误：</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(validationErrors)
              .filter(([_, error]) => error)
              .map(([param, error]) => (
                <li key={param}>{error}</li>
              ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
};

export default AdvancedNodeProperties;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Delete,
  ExpandMore,
  Add,
  Settings,
} from '@mui/icons-material';
import { Node } from 'reactflow';
import { CustomNodeData } from './nodes/CustomNode';
import HttpRequestProperties from './HttpRequestProperties';
import AdvancedNodeProperties from './AdvancedNodeProperties';

interface NodePropertiesProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: Partial<CustomNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
}

const NodeProperties: React.FC<NodePropertiesProps> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
}) => {
  const [nodeData, setNodeData] = useState<CustomNodeData | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setNodeData(selectedNode.data as CustomNodeData);
      setParameters(selectedNode.data.config || {});
    } else {
      setNodeData(null);
      setParameters({});
    }
  }, [selectedNode]);

  const handleLabelChange = (label: string) => {
    if (selectedNode && nodeData) {
      const updatedData = { ...nodeData, label };
      setNodeData(updatedData);
      onUpdateNode(selectedNode.id, updatedData);
    }
  };

  const handleDescriptionChange = (description: string) => {
    if (selectedNode && nodeData) {
      const updatedData = { ...nodeData, description };
      setNodeData(updatedData);
      onUpdateNode(selectedNode.id, updatedData);
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    const updatedParameters = { ...parameters, [key]: value };
    setParameters(updatedParameters);
    
    if (selectedNode && nodeData) {
      const updatedData = { ...nodeData, config: updatedParameters };
      setNodeData(updatedData);
      onUpdateNode(selectedNode.id, updatedData);
    }
  };

  const addParameter = () => {
    const key = `param_${Object.keys(parameters).length + 1}`;
    handleParameterChange(key, '');
  };

  const removeParameter = (key: string) => {
    const updatedParameters = { ...parameters };
    delete updatedParameters[key];
    setParameters(updatedParameters);
    
    if (selectedNode && nodeData) {
      const updatedData = { ...nodeData, config: updatedParameters };
      setNodeData(updatedData);
      onUpdateNode(selectedNode.id, updatedData);
    }
  };

  if (!selectedNode || !nodeData) {
    return (
      <Paper
        elevation={2}
        sx={{
          width: 300,
          height: '100%',
          p: 2,
          backgroundColor: '#fafafa',
          borderLeft: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          选择一个节点来编辑属性
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: 300,
        height: '100%',
        backgroundColor: '#fafafa',
        borderLeft: '1px solid #e0e0e0',
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Settings sx={{ mr: 1, color: '#666' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            节点属性
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* 基本信息 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">基本信息</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="节点名称"
                value={nodeData.label || ''}
                onChange={(e) => handleLabelChange(e.target.value)}
                size="small"
                fullWidth
              />
              
              <TextField
                label="描述"
                value={nodeData.description || ''}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                size="small"
                fullWidth
                multiline
                rows={2}
              />
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  节点ID: {selectedNode.id}
                </Typography>
              </Box>
              
              <Box>
                <Chip
                  label={selectedNode.type}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        {/* 样式配置 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">样式配置</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="节点颜色"
                type="color"
                value={nodeData.color || '#1976d2'}
                onChange={(e) => {
                  if (selectedNode && nodeData) {
                    const updatedData = { ...nodeData, color: e.target.value };
                    setNodeData(updatedData);
                    onUpdateNode(selectedNode.id, updatedData);
                  }
                }}
                size="small"
                fullWidth
                InputProps={{
                  sx: { height: 40 }
                }}
              />
              
              <FormControl size="small" fullWidth>
                <InputLabel>图标类型</InputLabel>
                <Select
                  value={nodeData.iconType || 'default'}
                  label="图标类型"
                  onChange={(e) => {
                    if (selectedNode && nodeData) {
                      const updatedData = { ...nodeData, iconType: e.target.value };
                      setNodeData(updatedData);
                      onUpdateNode(selectedNode.id, updatedData);
                    }
                  }}
                >
                  <MenuItem value="default">默认</MenuItem>
                  <MenuItem value="play">播放</MenuItem>
                  <MenuItem value="stop">停止</MenuItem>
                  <MenuItem value="settings">设置</MenuItem>
                  <MenuItem value="code">代码</MenuItem>
                  <MenuItem value="database">数据库</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        {/* 参数配置 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">参数配置</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(parameters).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label="参数名"
                    value={key}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled
                  />
                  <TextField
                    label="值"
                    value={value}
                    onChange={(e) => handleParameterChange(key, e.target.value)}
                    size="small"
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeParameter(key)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              <Button
                startIcon={<Add />}
                onClick={addParameter}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                添加参数
              </Button>
            </Box>
          </AccordionDetails>
      </Accordion>

      {/* HTTP请求节点专门配置 */}
      {selectedNode.type === 'httpRequest' && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">HTTP请求配置</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <HttpRequestProperties
              nodeData={selectedNode.data}
              onUpdateConfig={(config) => {
                const updatedData = { ...selectedNode.data, config };
                onUpdateNode(selectedNode.id, updatedData);
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* 高级节点的专门配置 */}
      {(selectedNode.type === 'advanced' || selectedNode.type === 'aiModel' || selectedNode.type === 'subworkflow') && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">高级配置</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AdvancedNodeProperties
              nodeData={nodeData}
              onUpdateConfig={(config) => {
                const updatedData = { ...nodeData, config };
                if (selectedNode) {
                  setNodeData(updatedData);
                  onUpdateNode(selectedNode.id, updatedData);
                }
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* 行为配置 */}
      <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">行为配置</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 输入端口配置 */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  输入端口
                </Typography>
                {(nodeData.inputs || []).map((input, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField
                      label="端口名称"
                      value={input.label}
                      onChange={(e) => {
                        if (selectedNode && nodeData) {
                          const updatedInputs = [...(nodeData.inputs || [])];
                          updatedInputs[index] = { ...input, label: e.target.value };
                          const updatedData = { ...nodeData, inputs: updatedInputs };
                          setNodeData(updatedData);
                          onUpdateNode(selectedNode.id, updatedData);
                        }
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <InputLabel>类型</InputLabel>
                      <Select
                        value={input.type}
                        label="类型"
                        onChange={(e) => {
                          if (selectedNode && nodeData) {
                            const updatedInputs = [...(nodeData.inputs || [])];
                            updatedInputs[index] = { ...input, type: e.target.value };
                            const updatedData = { ...nodeData, inputs: updatedInputs };
                            setNodeData(updatedData);
                            onUpdateNode(selectedNode.id, updatedData);
                          }
                        }}
                      >
                        <MenuItem value="string">文本</MenuItem>
                        <MenuItem value="number">数字</MenuItem>
                        <MenuItem value="boolean">布尔</MenuItem>
                        <MenuItem value="object">对象</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (selectedNode && nodeData) {
                          const updatedInputs = (nodeData.inputs || []).filter((_, i) => i !== index);
                          const updatedData = { ...nodeData, inputs: updatedInputs };
                          setNodeData(updatedData);
                          onUpdateNode(selectedNode.id, updatedData);
                        }
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    if (selectedNode && nodeData) {
                      const newInput = {
                        id: `input_${(nodeData.inputs || []).length + 1}`,
                        label: `输入${(nodeData.inputs || []).length + 1}`,
                        type: 'string'
                      };
                      const updatedInputs = [...(nodeData.inputs || []), newInput];
                      const updatedData = { ...nodeData, inputs: updatedInputs };
                      setNodeData(updatedData);
                      onUpdateNode(selectedNode.id, updatedData);
                    }
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none', mt: 1 }}
                >
                  添加输入端口
                </Button>
              </Box>
              
              {/* 输出端口配置 */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  输出端口
                </Typography>
                {(nodeData.outputs || []).map((output, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField
                      label="端口名称"
                      value={output.label}
                      onChange={(e) => {
                        if (selectedNode && nodeData) {
                          const updatedOutputs = [...(nodeData.outputs || [])];
                          updatedOutputs[index] = { ...output, label: e.target.value };
                          const updatedData = { ...nodeData, outputs: updatedOutputs };
                          setNodeData(updatedData);
                          onUpdateNode(selectedNode.id, updatedData);
                        }
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <InputLabel>类型</InputLabel>
                      <Select
                        value={output.type}
                        label="类型"
                        onChange={(e) => {
                          if (selectedNode && nodeData) {
                            const updatedOutputs = [...(nodeData.outputs || [])];
                            updatedOutputs[index] = { ...output, type: e.target.value };
                            const updatedData = { ...nodeData, outputs: updatedOutputs };
                            setNodeData(updatedData);
                            onUpdateNode(selectedNode.id, updatedData);
                          }
                        }}
                      >
                        <MenuItem value="string">文本</MenuItem>
                        <MenuItem value="number">数字</MenuItem>
                        <MenuItem value="boolean">布尔</MenuItem>
                        <MenuItem value="object">对象</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (selectedNode && nodeData) {
                          const updatedOutputs = (nodeData.outputs || []).filter((_, i) => i !== index);
                          const updatedData = { ...nodeData, outputs: updatedOutputs };
                          setNodeData(updatedData);
                          onUpdateNode(selectedNode.id, updatedData);
                        }
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={() => {
                    if (selectedNode && nodeData) {
                      const newOutput = {
                        id: `output_${(nodeData.outputs || []).length + 1}`,
                        label: `输出${(nodeData.outputs || []).length + 1}`,
                        type: 'string'
                      };
                      const updatedOutputs = [...(nodeData.outputs || []), newOutput];
                      const updatedData = { ...nodeData, outputs: updatedOutputs };
                      setNodeData(updatedData);
                      onUpdateNode(selectedNode.id, updatedData);
                    }
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: 'none', mt: 1 }}
                >
                  添加输出端口
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        {/* 删除节点 */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => {
              if (selectedNode) {
                onDeleteNode(selectedNode.id);
              }
            }}
            sx={{ textTransform: 'none' }}
          >
            删除节点
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default NodeProperties;
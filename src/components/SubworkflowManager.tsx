import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  PlayArrow,
  Stop,
  ExpandMore,
  Input,
  Output,
  AccountTree,
  Inventory,
} from '@mui/icons-material';
import { Node, Edge } from 'reactflow';
import { AdvancedNodeData, AdvancedPort } from './nodes/AdvancedNode';

// 子流程定义接口
export interface SubworkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
  inputPorts: AdvancedPort[];
  outputPorts: AdvancedPort[];
  inputMapping: Record<string, string>; // 外部输入到内部节点的映射
  outputMapping: Record<string, string>; // 内部节点到外部输出的映射
  parameters: Record<string, any>; // 子流程参数
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    icon?: string;
    color?: string;
  };
}

// 端口映射配置
interface PortMapping {
  externalPort: string;
  internalNodeId: string;
  internalPortId: string;
  portType: 'input' | 'output';
}

interface SubworkflowManagerProps {
  currentNodes: Node[];
  currentEdges: Edge[];
  selectedNodes: string[];
  onCreateSubworkflow: (definition: SubworkflowDefinition) => void;
  onLoadSubworkflow: (definition: SubworkflowDefinition) => void;
  existingSubworkflows: SubworkflowDefinition[];
}

const SubworkflowManager: React.FC<SubworkflowManagerProps> = ({
  currentNodes,
  currentEdges,
  selectedNodes,
  onCreateSubworkflow,
  onLoadSubworkflow,
  existingSubworkflows,
}) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [subworkflowData, setSubworkflowData] = useState<Partial<SubworkflowDefinition>>({
    name: '',
    description: '',
    version: '1.0.0',
    category: 'Custom',
    inputPorts: [],
    outputPorts: [],
    inputMapping: {},
    outputMapping: {},
    parameters: {},
    metadata: {
      author: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      color: '#2196f3'
    }
  });
  const [portMappings, setPortMappings] = useState<PortMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 获取选中节点的信息
  const getSelectedNodesInfo = useCallback(() => {
    const selectedNodeObjects = currentNodes.filter(node => selectedNodes.includes(node.id));
    const selectedEdgeObjects = currentEdges.filter(edge => 
      selectedNodes.includes(edge.source) && selectedNodes.includes(edge.target)
    );
    
    return {
      nodes: selectedNodeObjects,
      edges: selectedEdgeObjects,
      nodeCount: selectedNodeObjects.length,
      edgeCount: selectedEdgeObjects.length
    };
  }, [currentNodes, currentEdges, selectedNodes]);

  // 分析选中节点的输入输出端口
  const analyzePortsFromSelection = useCallback(() => {
    const { nodes, edges } = getSelectedNodesInfo();
    const externalInputs: AdvancedPort[] = [];
    const externalOutputs: AdvancedPort[] = [];
    
    nodes.forEach(node => {
      const nodeData = node.data as AdvancedNodeData;
      
      // 检查输入端口是否有外部连接
      nodeData.inputs?.forEach(input => {
        const hasExternalConnection = currentEdges.some(edge => 
          edge.target === node.id && 
          edge.targetHandle === input.id &&
          !selectedNodes.includes(edge.source)
        );
        
        if (hasExternalConnection) {
          externalInputs.push({
            ...input,
            id: `input_${input.id}_${node.id}`,
            name: `${node.data.label}_${input.name}`
          });
        }
      });
      
      // 检查输出端口是否有外部连接
      nodeData.outputs?.forEach(output => {
        const hasExternalConnection = currentEdges.some(edge => 
          edge.source === node.id && 
          edge.sourceHandle === output.id &&
          !selectedNodes.includes(edge.target)
        );
        
        if (hasExternalConnection) {
          externalOutputs.push({
            ...output,
            id: `output_${output.id}_${node.id}`,
            name: `${node.data.label}_${output.name}`
          });
        }
      });
    });
    
    return { externalInputs, externalOutputs };
  }, [getSelectedNodesInfo, currentEdges, selectedNodes]);

  // 验证子流程配置
  const validateSubworkflow = (): string[] => {
    const errors: string[] = [];
    
    if (!subworkflowData.name?.trim()) {
      errors.push('子流程名称不能为空');
    }
    
    if (!subworkflowData.description?.trim()) {
      errors.push('子流程描述不能为空');
    }
    
    if (selectedNodes.length === 0) {
      errors.push('请选择要封装的节点');
    }
    
    if (subworkflowData.inputPorts?.length === 0 && subworkflowData.outputPorts?.length === 0) {
      errors.push('子流程至少需要一个输入或输出端口');
    }
    
    return errors;
  };

  // 创建子流程
  const handleCreateSubworkflow = () => {
    const errors = validateSubworkflow();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const { nodes, edges } = getSelectedNodesInfo();
    
    const definition: SubworkflowDefinition = {
      id: `subworkflow_${Date.now()}`,
      name: subworkflowData.name!,
      description: subworkflowData.description!,
      version: subworkflowData.version!,
      category: subworkflowData.category!,
      nodes,
      edges,
      inputPorts: subworkflowData.inputPorts!,
      outputPorts: subworkflowData.outputPorts!,
      inputMapping: subworkflowData.inputMapping!,
      outputMapping: subworkflowData.outputMapping!,
      parameters: subworkflowData.parameters!,
      metadata: {
        ...subworkflowData.metadata!,
        updatedAt: new Date()
      }
    };
    
    onCreateSubworkflow(definition);
    setOpen(false);
    resetForm();
  };

  // 重置表单
  const resetForm = () => {
    setActiveStep(0);
    setSubworkflowData({
      name: '',
      description: '',
      version: '1.0.0',
      category: 'Custom',
      inputPorts: [],
      outputPorts: [],
      inputMapping: {},
      outputMapping: {},
      parameters: {},
      metadata: {
        author: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        color: '#2196f3'
      }
    });
    setPortMappings([]);
    setValidationErrors([]);
  };

  // 添加输入端口
  const addInputPort = () => {
    const newPort: AdvancedPort = {
      id: `input_${Date.now()}`,
      name: `输入${(subworkflowData.inputPorts?.length || 0) + 1}`,
      type: 'data',
      required: false
    };
    
    setSubworkflowData(prev => ({
      ...prev,
      inputPorts: [...(prev.inputPorts || []), newPort]
    }));
  };

  // 添加输出端口
  const addOutputPort = () => {
    const newPort: AdvancedPort = {
      id: `output_${Date.now()}`,
      name: `输出${(subworkflowData.outputPorts?.length || 0) + 1}`,
      type: 'data',
      required: false
    };
    
    setSubworkflowData(prev => ({
      ...prev,
      outputPorts: [...(prev.outputPorts || []), newPort]
    }));
  };

  // 自动分析并设置端口
  const autoAnalyzePorts = () => {
    const { externalInputs, externalOutputs } = analyzePortsFromSelection();
    
    setSubworkflowData(prev => ({
      ...prev,
      inputPorts: externalInputs,
      outputPorts: externalOutputs
    }));
  };

  const steps = [
    {
      label: '基本信息',
      content: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="子流程名称"
            value={subworkflowData.name || ''}
            onChange={(e) => setSubworkflowData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="描述"
            value={subworkflowData.description || ''}
            onChange={(e) => setSubworkflowData(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="版本"
              value={subworkflowData.version || ''}
              onChange={(e) => setSubworkflowData(prev => ({ ...prev, version: e.target.value }))}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>类别</InputLabel>
              <Select
                value={subworkflowData.category || ''}
                label="类别"
                onChange={(e) => setSubworkflowData(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="Custom">自定义</MenuItem>
                <MenuItem value="AI/ML">AI/ML</MenuItem>
                <MenuItem value="Data">数据处理</MenuItem>
                <MenuItem value="Utility">工具</MenuItem>
                <MenuItem value="Integration">集成</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )
    },
    {
      label: '选择节点',
      content: (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            已选择 {selectedNodes.length} 个节点进行封装
          </Alert>
          <Typography variant="h6" gutterBottom>选中的节点：</Typography>
          <List>
            {getSelectedNodesInfo().nodes.map(node => (
              <ListItem key={node.id}>
                <ListItemText
                  primary={node.data.label}
                  secondary={`ID: ${node.id} | 类型: ${node.type}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )
    },
    {
      label: '配置端口',
      content: (
        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              startIcon={<AccountTree />}
              onClick={autoAnalyzePorts}
              variant="outlined"
              size="small"
            >
              自动分析端口
            </Button>
          </Box>
          
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">输入端口</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {subworkflowData.inputPorts?.map((port, index) => (
                  <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      label="端口名称"
                      value={port.name}
                      onChange={(e) => {
                        const updatedPorts = [...(subworkflowData.inputPorts || [])];
                        updatedPorts[index] = { ...port, name: e.target.value };
                        setSubworkflowData(prev => ({ ...prev, inputPorts: updatedPorts }));
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>类型</InputLabel>
                      <Select
                        value={port.type}
                        label="类型"
                        onChange={(e) => {
                          const updatedPorts = [...(subworkflowData.inputPorts || [])];
                          updatedPorts[index] = { ...port, type: e.target.value as any };
                          setSubworkflowData(prev => ({ ...prev, inputPorts: updatedPorts }));
                        }}
                      >
                        <MenuItem value="data">数据</MenuItem>
                        <MenuItem value="text">文本</MenuItem>
                        <MenuItem value="number">数字</MenuItem>
                        <MenuItem value="image">图像</MenuItem>
                        <MenuItem value="control">控制</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      onClick={() => {
                        const updatedPorts = subworkflowData.inputPorts?.filter((_, i) => i !== index) || [];
                        setSubworkflowData(prev => ({ ...prev, inputPorts: updatedPorts }));
                      }}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={addInputPort}
                  variant="outlined"
                  size="small"
                >
                  添加输入端口
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">输出端口</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {subworkflowData.outputPorts?.map((port, index) => (
                  <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      label="端口名称"
                      value={port.name}
                      onChange={(e) => {
                        const updatedPorts = [...(subworkflowData.outputPorts || [])];
                        updatedPorts[index] = { ...port, name: e.target.value };
                        setSubworkflowData(prev => ({ ...prev, outputPorts: updatedPorts }));
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>类型</InputLabel>
                      <Select
                        value={port.type}
                        label="类型"
                        onChange={(e) => {
                          const updatedPorts = [...(subworkflowData.outputPorts || [])];
                          updatedPorts[index] = { ...port, type: e.target.value as any };
                          setSubworkflowData(prev => ({ ...prev, outputPorts: updatedPorts }));
                        }}
                      >
                        <MenuItem value="data">数据</MenuItem>
                        <MenuItem value="text">文本</MenuItem>
                        <MenuItem value="number">数字</MenuItem>
                        <MenuItem value="image">图像</MenuItem>
                        <MenuItem value="control">控制</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      onClick={() => {
                        const updatedPorts = subworkflowData.outputPorts?.filter((_, i) => i !== index) || [];
                        setSubworkflowData(prev => ({ ...prev, outputPorts: updatedPorts }));
                      }}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={addOutputPort}
                  variant="outlined"
                  size="small"
                >
                  添加输出端口
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )
    },
    {
      label: '确认创建',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>子流程摘要</Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography><strong>名称：</strong>{subworkflowData.name}</Typography>
            <Typography><strong>描述：</strong>{subworkflowData.description}</Typography>
            <Typography><strong>版本：</strong>{subworkflowData.version}</Typography>
            <Typography><strong>类别：</strong>{subworkflowData.category}</Typography>
            <Typography><strong>节点数量：</strong>{selectedNodes.length}</Typography>
            <Typography><strong>输入端口：</strong>{subworkflowData.inputPorts?.length || 0}</Typography>
            <Typography><strong>输出端口：</strong>{subworkflowData.outputPorts?.length || 0}</Typography>
          </Paper>
          
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">请修正以下错误：</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Button
        startIcon={<Inventory />}
        onClick={() => setOpen(true)}
        variant="contained"
        disabled={selectedNodes.length === 0}
      >
        封装为子流程
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>创建子流程</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  {step.content}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (index === steps.length - 1) {
                          handleCreateSubworkflow();
                        } else {
                          setActiveStep(index + 1);
                        }
                      }}
                      sx={{ mr: 1 }}
                    >
                      {index === steps.length - 1 ? '创建子流程' : '下一步'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={() => setActiveStep(index - 1)}
                    >
                      上一步
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubworkflowManager;
export type { SubworkflowDefinition, PortMapping };
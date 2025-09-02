import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../stores/workflowStore';
import ReactFlow, {
  ReactFlowProvider,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeft, 
  Settings, 
  AlertCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  PanelLeftOpen,
  PanelRightOpen
} from 'lucide-react';
import {
  Save,
  PlayArrow as Play,
  Code,
  Visibility as Eye,
} from '@mui/icons-material';
import { nodeTypes } from '../components/nodes';
import NodePanel from '../components/NodePanel';
import NodeProperties from '../components/NodeProperties';
import { toast } from 'sonner';
import { aiModelNodeData } from '../components/nodes/AIModelNode';
import { AdvancedNodeData } from '../components/nodes/AdvancedNode';

interface WorkflowDefinition {
  nodes: Array<{
    id: string;
    type: string;
    name: string;
    parameters: Record<string, any>;
    position?: { x: number; y: number };
  }>;
  connections: Array<{
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
}

// 初始节点
const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'start',
    position: { x: 250, y: 50 },
    data: {
      label: '开始节点',
      name: '开始节点',
      parameters: { triggerType: 'manual' }
    }
  }
];

const initialEdges: Edge[] = [];

const WorkflowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentWorkflow,
    loading,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    executeWorkflow,
    resetCurrentWorkflow
  } = useWorkflowStore();

  const [workflowName, setWorkflowName] = useState('');
  const [workflowDefinition, setWorkflowDefinition] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // 面板状态管理 - 从本地存储读取用户偏好
  const [leftPanelOpen, setLeftPanelOpen] = useState(() => {
    const saved = localStorage.getItem('workflow-editor-left-panel');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [rightPanelOpen, setRightPanelOpen] = useState(() => {
    const saved = localStorage.getItem('workflow-editor-right-panel');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 保存面板状态到本地存储
  useEffect(() => {
    localStorage.setItem('workflow-editor-left-panel', JSON.stringify(leftPanelOpen));
  }, [leftPanelOpen]);
  
  useEffect(() => {
    localStorage.setItem('workflow-editor-right-panel', JSON.stringify(rightPanelOpen));
  }, [rightPanelOpen]);
  
  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'Enter':
            if (isEditMode && !executing && isActive) {
              e.preventDefault();
              handleExecute();
            }
            break;
          case 'f':
            if (e.shiftKey) {
              e.preventDefault();
              setIsFullscreen(!isFullscreen);
            }
            break;
          case '[':
            e.preventDefault();
            setLeftPanelOpen(!leftPanelOpen);
            break;
          case ']':
            e.preventDefault();
            setRightPanelOpen(!rightPanelOpen);
            break;
        }
      }
      
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
   }, [isFullscreen, leftPanelOpen, rightPanelOpen, executing, isActive]);
  
  // 编辑模式判断
  const isEditMode = id !== 'new';
  
  // ReactFlow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // 窗口大小变化监听
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const debouncedResize = debounce(handleResize, 100);
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 计算侧边栏宽度
  const getSidebarWidth = () => {
    const { width } = windowSize;
    if (width < 640) return '100vw'; // 小屏幕全宽
    if (width < 768) return '288px'; // md
    if (width < 1024) return '288px'; // lg
    if (width < 1280) return '250px'; // xl
    return '384px'; // 2xl+
  };

  // ReactFlow 回调函数
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback((type: string, position?: { x: number; y: number }) => {
    const nodeLabels = {
      start: '开始',
      action: '动作',
      httpRequest: 'HTTP请求',
      condition: '条件',
      end: '结束',
      aiModel: 'AI模型',
      subworkflow: '子流程',
      advanced: '高级节点',
      custom: '自定义'
    };
    
    // 为高级节点类型设置正确的默认数据结构
    const getDefaultNodeData = (nodeType: string) => {
      const baseData = {
        label: `${nodeLabels[nodeType as keyof typeof nodeLabels] || nodeType} 节点`,
        name: `${nodeLabels[nodeType as keyof typeof nodeLabels] || nodeType} 节点`,
        description: `${nodeLabels[nodeType as keyof typeof nodeLabels] || nodeType}节点`
      };
      
      // 子流程节点需要特殊的数据结构
      if (nodeType === 'subworkflow') {
        return {
          ...baseData,
          parameters: [], // 高级节点需要数组类型的参数
          parameterValues: {},
          inputs: [],
          outputs: [],
          executionConfig: {
            timeout: 30000,
            retryCount: 0,
            cacheEnabled: false,
            parallelExecution: false
          },
          // 子流程特有字段
          subworkflowId: '',
          subworkflowDefinition: {
            id: '',
            name: '新建子流程',
            description: '子流程描述',
            version: '1.0.0',
            category: 'Custom',
            nodes: [],
            edges: [],
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
          },
          executionMode: 'sync',
          debugMode: false,
          isolationLevel: 'none',
          errorHandling: {
            onError: 'stop',
            maxRetries: 0,
            retryDelay: 1000
          }
        };
      }
      
      // AI模型节点的默认数据结构
      if (nodeType === 'aiModel') {
        return {
          ...baseData,
          parameters: aiModelNodeData.parameters || [],
          parameterValues: {},
          inputs: aiModelNodeData.inputs || [],
          outputs: aiModelNodeData.outputs || [],
          executionConfig: {
            timeout: 30000,
            retryCount: 0,
            cacheEnabled: false,
            parallelExecution: false
          }
        };
      }
      
      // 高级节点的默认数据结构
       if (nodeType === 'advanced') {
         return {
           ...baseData,
           parameters: [
             {
               name: 'example_param',
               type: 'text',
               label: '示例参数',
               description: '这是一个示例参数，您可以根据需要修改',
               required: false,
               defaultValue: ''
             }
           ],
           parameterValues: {},
           inputs: [
             {
               id: 'input',
               label: '输入',
               type: 'data',
               required: true
             }
           ],
           outputs: [
             {
               id: 'output',
               label: '输出',
               type: 'data',
               required: true
             }
           ],
           executionConfig: {
             timeout: 30000,
             retryCount: 0,
             cacheEnabled: false,
             parallelExecution: false
           }
         };
       }
      
      // 普通节点使用对象类型的参数
      return {
        ...baseData,
        parameters: {}
      };
    };
    
    const newNode: Node = {
      id: `node_${nodeIdCounter}`,
      type,
      position: position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: getDefaultNodeData(type)
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter(prev => prev + 1);
  }, [nodeIdCounter, setNodes]);

  // 拖拽处理函数
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (typeof type === 'undefined' || !type) {
      return;
    }

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    addNode(type, position);
  }, [addNode]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  useEffect(() => {
    if (isEditMode && id) {
      fetchWorkflow(id);
    } else {
      resetCurrentWorkflow();
      // 设置新工作流的默认值
      setWorkflowName('');
      setNodes(initialNodes);
      setEdges(initialEdges);
      setWorkflowDefinition(JSON.stringify({
        nodes: [
          {
            id: 'start',
            type: 'trigger',
            name: '开始节点',
            parameters: {
              triggerType: 'manual'
            },
            position: { x: 250, y: 50 }
          }
        ],
        connections: []
      }, null, 2));
      setIsActive(true);
    }

    return () => {
      resetCurrentWorkflow();
    };
  }, [id, isEditMode, setNodes, setEdges]);

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowName(currentWorkflow.name);
      setWorkflowDefinition(JSON.stringify(currentWorkflow.definition, null, 2));
      setIsActive(currentWorkflow.isActive);
      
      // 转换工作流定义为ReactFlow格式
      if (currentWorkflow.definition) {
        const definition = currentWorkflow.definition as WorkflowDefinition;
        
        // 转换节点
        const flowNodes: Node[] = definition.nodes?.map((node, index) => ({
          id: node.id,
          type: node.type === 'trigger' ? 'start' : node.type,
          position: node.position || { x: 100 + index * 200, y: 100 },
          data: {
            label: node.name,
            name: node.name,
            parameters: node.parameters
          }
        })) || [];
        
        // 转换边
        const flowEdges: Edge[] = definition.connections?.map((conn, index) => ({
          id: `edge_${index}`,
          source: conn.source,
          target: conn.target,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle
        })) || [];
        
        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    }
  }, [currentWorkflow, setNodes, setEdges]);

  const validateJsonDefinition = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        setJsonError('工作流定义必须包含 nodes 数组');
        return false;
      }
      if (!parsed.connections || !Array.isArray(parsed.connections)) {
        setJsonError('工作流定义必须包含 connections 数组');
        return false;
      }
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError('JSON 格式错误');
      return false;
    }
  };

  const handleDefinitionChange = (value: string) => {
    setWorkflowDefinition(value);
    if (validateJsonDefinition(value)) {
      try {
        const definition = JSON.parse(value) as WorkflowDefinition;
        
        // 同步到ReactFlow
        const flowNodes: Node[] = definition.nodes?.map((node, index) => ({
          id: node.id,
          type: node.type === 'trigger' ? 'start' : node.type,
          position: node.position || { x: 100 + index * 200, y: 100 },
          data: {
            label: node.name,
            name: node.name,
            parameters: node.parameters
          }
        })) || [];
        
        const flowEdges: Edge[] = definition.connections?.map((conn, index) => ({
          id: `edge_${index}`,
          source: conn.source,
          target: conn.target,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle
        })) || [];
        
        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (error) {
        // JSON解析错误，不更新ReactFlow
      }
    }
  };

  // 同步ReactFlow数据到JSON定义
  const syncFlowToDefinition = useCallback(() => {
    const definition: WorkflowDefinition = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type === 'start' ? 'trigger' : node.type || 'action',
        name: node.data.name || node.data.label,
        parameters: node.data.parameters || {},
        position: node.position
      })),
      connections: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    };
    
    setWorkflowDefinition(JSON.stringify(definition, null, 2));
  }, [nodes, edges]);

  // 当节点或边发生变化时，同步到JSON定义
  useEffect(() => {
    if (viewMode === 'visual') {
      syncFlowToDefinition();
    }
  }, [nodes, edges, viewMode, syncFlowToDefinition]);

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error('请输入工作流名称');
      return;
    }

    if (!validateJsonDefinition(workflowDefinition)) {
      toast.error('工作流定义格式错误');
      return;
    }

    setSaving(true);
    try {
      const definition = JSON.parse(workflowDefinition);
      
      if (isEditMode && id) {
        const result = await updateWorkflow(id, {
          name: workflowName,
          definition,
          isActive
        });
        if (result) {
          toast.success('工作流保存成功');
        }
      } else {
        const result = await createWorkflow({
          name: workflowName,
          definition,
          isActive
        });
        if (result) {
          toast.success('工作流创建成功');
          navigate(`/workflows/${result.id}/edit`);
        }
      }
    } catch (error) {
      console.error('保存工作流失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!isEditMode || !id) {
      toast.error('请先保存工作流');
      return;
    }

    setExecuting(true);
    try {
      const result = await executeWorkflow(id);
      if (result) {
        toast.success(`工作流执行成功，执行ID: ${result.executionId}`);
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  const renderVisualEditor = () => {
    return (
      <ReactFlowProvider>
        <div className={`relative flex ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full min-h-[400px]'} border border-gray-200 rounded-lg overflow-hidden`}>
          {/* 左侧节点面板 - 响应式宽度 */}
          <div className={`transition-all duration-300 ease-in-out ${
            leftPanelOpen 
              ? windowSize.width < 768 
                ? 'fixed inset-y-0 left-0 w-80 z-30' 
                : 'w-80 md:w-72 lg:w-80 xl:w-96 min-w-[250px] max-w-[250px]'
              : 'w-0'
          } ${leftPanelOpen ? 'opacity-100' : 'opacity-0'} overflow-hidden bg-gray-50 border-r border-gray-200 flex-shrink-0 ${
            windowSize.width < 768 && leftPanelOpen ? 'shadow-lg' : ''
          }`}>
            {leftPanelOpen && <NodePanel onAddNode={addNode} />}
          </div>
          
          {/* 移动端遮罩层 */}
          {windowSize.width < 768 && leftPanelOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={() => setLeftPanelOpen(false)}
            />
          )}
          
          {/* 左侧面板控制按钮 - 动态位置 */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white border border-gray-300 rounded-r-md p-2 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            style={{ 
              left: leftPanelOpen ? getSidebarWidth() : '0px' 
            }}
            title={`${leftPanelOpen ? '隐藏' : '显示'}节点面板 (Ctrl+[)`}
          >
            {leftPanelOpen ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <PanelLeftOpen className="w-4 h-4 text-gray-600" />}
          </button>
          
          {/* 中间画布区域 - 自适应剩余空间 */}
          <div className="flex-1 min-w-0 relative" style={{ minHeight: '1200px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              style={{ width: '100%', height: '100%' }}
            >
              <Background variant={BackgroundVariant.Dots} />
              <Controls />
              <MiniMap />
              
              {/* 顶部工具栏 */}
              <Panel position="top-left">
                <div className="flex items-center gap-2 bg-white p-2 rounded shadow">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={`${isFullscreen ? '退出全屏' : '全屏模式'} (Ctrl+Shift+F)`}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                  
                  <div className="h-4 w-px bg-gray-300"></div>
                  
                  <div className="text-xs text-gray-500 px-2 hidden sm:block">
                    快捷键: Ctrl+S保存 | Ctrl+Enter执行 | Ctrl+[/]切换面板
                  </div>
                </div>
              </Panel>
              
              {/* 状态信息 */}
              <Panel position="top-right">
                <div className="bg-white p-2 rounded shadow text-sm">
                  节点数: {nodes.length} | 连接数: {edges.length}
                </div>
              </Panel>
            </ReactFlow>
          </div>
          
          {/* 右侧面板控制按钮 - 动态位置 */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white border border-gray-300 rounded-l-md p-2 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            style={{ 
              right: rightPanelOpen ? getSidebarWidth() : '0px' 
            }}
            title={`${rightPanelOpen ? '隐藏' : '显示'}属性面板 (Ctrl+])`}
          >
            {rightPanelOpen ? <ChevronRight className="w-4 h-4 text-gray-600" /> : <PanelRightOpen className="w-4 h-4 text-gray-600" />}
          </button>
          
          {/* 右侧节点属性面板 - 响应式宽度 */}
          <div className={`transition-all duration-300 ease-in-out ${
            rightPanelOpen 
              ? windowSize.width < 768 
                ? 'fixed inset-y-0 right-0 w-80 z-30' 
                : 'w-80 md:w-72 lg:w-80 xl:w-96 min-w-[280px] max-w-[400px]'
              : 'w-0'
          } ${rightPanelOpen ? 'opacity-100' : 'opacity-0'} overflow-hidden bg-gray-50 border-l border-gray-200 flex-shrink-0 ${
            windowSize.width < 768 && rightPanelOpen ? 'shadow-lg' : ''
          }`}>
            {rightPanelOpen && (
              <NodeProperties
                selectedNode={selectedNode}
                onUpdateNode={updateNodeData}
                onDeleteNode={deleteNode}
              />
            )}
          </div>
          
          {/* 移动端遮罩层 */}
          {windowSize.width < 768 && rightPanelOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={() => setRightPanelOpen(false)}
            />
          )}
        </div>
      </ReactFlowProvider>
    );
  };

  const renderCodeEditor = () => {
    return (
      <div className="space-y-4">
        {jsonError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{jsonError}</span>
          </div>
        )}
        
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">工作流定义 (JSON)</span>
          </div>
          <textarea
            value={workflowDefinition}
            onChange={(e) => handleDefinitionChange(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm border-0 focus:ring-0 resize-none"
            placeholder="请输入工作流定义的 JSON 格式..."
          />
        </div>
        
        <div className="text-sm text-gray-600">
          <p className="mb-2">工作流定义格式说明：</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>nodes: 节点数组，每个节点包含 id、type、name 和 parameters</li>
            <li>connections: 连接数组，定义节点之间的连接关系</li>
            <li>支持的节点类型：trigger（触发器）、action（动作）、condition（条件）</li>
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回列表
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditMode ? '编辑工作流' : '创建工作流'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 视图切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                可视化
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'code'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                代码
              </button>
            </div>
            
            {/* 执行按钮 */}
            {isEditMode && (
              <button
                onClick={handleExecute}
                disabled={executing || !isActive}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {executing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {executing ? '执行中...' : '执行'}
              </button>
            )}
            
            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={saving || !!jsonError}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>


      {/* 主要内容区域 - 响应式布局 */}
      <div className={`${isFullscreen ? 'hidden' : 'flex-1 flex flex-col min-h-0'}`} style={{maxWidth: 'calc(100vw - 10px)', margin: '0 auto', width: '100%'}}>
        <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-0" style={{margin: '0 auto', width: '100%'}}>
          {/* 基本信息 - 响应式网格 */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex-shrink-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工作流名称 *
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入工作流名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用工作流</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 工作流编辑器 - 占据剩余空间 */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex-shrink-0">工作流设计</h2>
            <div className="flex-1 flex flex-col min-h-0">
              {viewMode === 'visual' ? renderVisualEditor() : renderCodeEditor()}
            </div>
          </div>
        </div>
      </div>
      
      {/* 全屏模式下的编辑器 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* 全屏模式顶部工具栏 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {workflowName || '未命名工作流'}
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <Minimize className="w-4 h-4" />
                  退出全屏
                </button>
                
                {/* 执行按钮 */}
                {isEditMode && (
                  <button
                    onClick={handleExecute}
                    disabled={executing || !isActive}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {executing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {executing ? '执行中...' : '执行'}
                  </button>
                )}
                
                {/* 保存按钮 */}
                <button
                  onClick={handleSave}
                  disabled={saving || !!jsonError}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
          
          {/* 全屏编辑器内容 */}
          <div className="h-[calc(100vh-80px)]">
            {renderVisualEditor()}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowEditor;
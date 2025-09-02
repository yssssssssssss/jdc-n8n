# 复杂节点设计与子流程封装实现方案

本文档详细介绍了如何在工作流编辑器中设计复杂节点（类似ComfyUI的大模型节点）以及如何将复杂流程打包成单个节点的完整实现方案。

## 目录

1. [复杂节点架构设计](#复杂节点架构设计)
2. [大模型节点实现](#大模型节点实现)
3. [子流程封装机制](#子流程封装机制)
4. [节点模板系统](#节点模板系统)
5. [使用指南](#使用指南)
6. [扩展开发](#扩展开发)

## 复杂节点架构设计

### 核心组件

#### 1. AdvancedNode 基础架构

`AdvancedNode.tsx` 提供了支持复杂配置的节点基础架构：

```typescript
// 参数模式定义
interface ParameterSchema {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'slider' | 'color' | 'json' | 'file' | 'group';
  defaultValue?: any;
  required?: boolean;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{ value: any; label: string }>;
  };
  conditional?: {
    dependsOn: string;
    condition: 'equals' | 'not_equals' | 'greater' | 'less';
    value: any;
  };
  group?: string;
  children?: ParameterSchema[];
}

// 高级端口定义
interface AdvancedPort {
  id: string;
  name: string;
  type: 'data' | 'text' | 'number' | 'image' | 'audio' | 'video' | 'control' | 'any';
  required?: boolean;
  multiple?: boolean;
  description?: string;
}

// 高级节点数据
interface AdvancedNodeData extends CustomNodeData {
  inputs: AdvancedPort[];
  outputs: AdvancedPort[];
  parameters: ParameterSchema[];
  executionConfig: {
    timeout: number;
    retries: number;
    cache: boolean;
  };
  runtimeState: NodeExecutionState;
  subworkflow?: SubworkflowConfig;
  template?: TemplateConfig;
  customRenderer?: string;
}
```

#### 2. 特性支持

- **多种参数类型**：字符串、数字、布尔、选择、多选、滑块、颜色、JSON、文件、分组
- **条件显示**：参数可根据其他参数值动态显示/隐藏
- **参数验证**：支持范围、模式、必填等验证规则
- **嵌套配置**：支持参数分组和层级结构
- **多端口类型**：支持数据、文本、数字、图像、音频、视频、控制等端口类型
- **多连接支持**：端口可支持多个连接
- **执行状态管理**：实时显示节点执行状态和进度

## 大模型节点实现

### AIModelNode 示例

`AIModelNode.tsx` 展示了如何实现类似ComfyUI的复杂AI模型节点：

```typescript
const aiModelNodeData: AdvancedNodeData = {
  // 基础配置
  label: 'AI模型',
  description: '大语言模型节点，支持多种AI模型和配置',
  
  // 输入端口
  inputs: [
    { id: 'prompt', name: '提示词', type: 'text', required: true },
    { id: 'image', name: '图像输入', type: 'image', required: false },
    { id: 'context', name: '上下文', type: 'data', required: false },
  ],
  
  // 输出端口
  outputs: [
    { id: 'text', name: '生成文本', type: 'text' },
    { id: 'tokens', name: 'Token信息', type: 'data' },
    { id: 'metadata', name: '元数据', type: 'data' },
  ],
  
  // 复杂参数配置
  parameters: [
    {
      id: 'model_group',
      name: '模型配置',
      type: 'group',
      children: [
        {
          id: 'model_type',
          name: '模型类型',
          type: 'select',
          defaultValue: 'gpt',
          validation: {
            options: [
              { value: 'gpt', label: 'GPT系列' },
              { value: 'claude', label: 'Claude系列' },
              { value: 'llama', label: 'LLaMA系列' },
            ]
          }
        },
        {
          id: 'model_name',
          name: '具体模型',
          type: 'select',
          conditional: {
            dependsOn: 'model_type',
            condition: 'equals',
            value: 'gpt'
          },
          validation: {
            options: [
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            ]
          }
        }
      ]
    },
    {
      id: 'generation_group',
      name: '生成配置',
      type: 'group',
      children: [
        {
          id: 'temperature',
          name: '温度',
          type: 'slider',
          defaultValue: 0.7,
          validation: { min: 0, max: 2 }
        },
        {
          id: 'max_tokens',
          name: '最大Token数',
          type: 'number',
          defaultValue: 1000,
          validation: { min: 1, max: 4000 }
        }
      ]
    }
  ]
};
```

### 关键特性

1. **模型选择**：支持多种AI模型类型和具体模型选择
2. **条件配置**：根据模型类型动态显示相应的模型选项
3. **参数分组**：将相关参数组织在一起，提高可读性
4. **参数验证**：确保输入参数的有效性
5. **多端口支持**：支持文本、图像、数据等多种输入输出类型

## 子流程封装机制

### SubworkflowManager 组件

`SubworkflowManager.tsx` 提供了将复杂流程打包成单个节点的完整解决方案：

#### 1. 子流程定义

```typescript
interface SubworkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  nodes: Node[];              // 包含的节点
  edges: Edge[];              // 节点间的连接
  inputPorts: AdvancedPort[]; // 外部输入端口
  outputPorts: AdvancedPort[];// 外部输出端口
  inputMapping: Record<string, string>;  // 输入映射
  outputMapping: Record<string, string>; // 输出映射
  parameters: Record<string, any>;       // 子流程参数
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}
```

#### 2. 封装流程

1. **选择节点**：用户在画布上选择要封装的节点
2. **分析端口**：自动分析选中节点的外部输入输出连接
3. **配置接口**：定义子流程的输入输出端口
4. **设置映射**：建立外部端口与内部节点的映射关系
5. **保存定义**：生成子流程定义并保存

#### 3. 使用步骤

```typescript
// 1. 创建子流程管理器
<SubworkflowManager
  currentNodes={nodes}
  currentEdges={edges}
  selectedNodes={selectedNodeIds}
  onCreateSubworkflow={handleCreateSubworkflow}
  onLoadSubworkflow={handleLoadSubworkflow}
  existingSubworkflows={subworkflows}
/>

// 2. 处理子流程创建
const handleCreateSubworkflow = (definition: SubworkflowDefinition) => {
  // 保存子流程定义
  saveSubworkflowDefinition(definition);
  
  // 创建子流程节点
  const subworkflowNode = createSubworkflowNode(definition);
  
  // 替换原有节点
  replaceNodesWithSubworkflow(selectedNodeIds, subworkflowNode);
};
```

### SubworkflowNode 组件

`SubworkflowNode.tsx` 实现了子流程节点的显示和执行：

#### 1. 节点特性

- **状态显示**：实时显示子流程执行状态
- **进度跟踪**：显示子流程内部节点执行进度
- **错误处理**：处理子流程执行中的错误
- **日志记录**：记录详细的执行日志
- **调试支持**：支持查看子流程内部执行情况

#### 2. 执行模式

```typescript
interface SubworkflowNodeData extends AdvancedNodeData {
  subworkflowId: string;
  subworkflowDefinition: SubworkflowDefinition;
  executionMode: 'sync' | 'async';     // 同步/异步执行
  debugMode: boolean;                   // 调试模式
  isolationLevel: 'none' | 'partial' | 'full'; // 隔离级别
  errorHandling: {
    onError: 'stop' | 'continue' | 'retry';
    maxRetries: number;
    retryDelay: number;
  };
}
```

## 节点模板系统

### NodeTemplateManager 组件

`NodeTemplateManager.tsx` 提供了节点模板的管理功能：

#### 1. 模板定义

```typescript
interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodeType: string;
  nodeData: AdvancedNodeData;
  configuration: {
    defaultParameters: Record<string, any>;
    requiredParameters: string[];
    optionalParameters: string[];
    parameterGroups: Array<{
      name: string;
      parameters: string[];
    }>;
  };
  examples: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
}
```

#### 2. 功能特性

- **模板保存**：将复杂节点配置保存为可复用模板
- **模板分类**：按类别组织模板
- **搜索过滤**：支持按名称、标签、类别搜索
- **评分系统**：用户可对模板进行评分
- **导入导出**：支持模板的导入导出
- **使用示例**：提供模板使用示例

## 使用指南

### 1. 创建复杂节点

```typescript
// 1. 定义节点数据
const complexNodeData: AdvancedNodeData = {
  label: '复杂处理节点',
  description: '执行复杂数据处理任务',
  inputs: [/* 输入端口定义 */],
  outputs: [/* 输出端口定义 */],
  parameters: [/* 参数配置 */],
  executionConfig: {
    timeout: 30000,
    retries: 3,
    cache: true
  }
};

// 2. 注册节点类型
export const nodeTypes = {
  complexNode: AdvancedNode,
  // 其他节点类型...
};

// 3. 添加到节点面板
const nodeTypes = [
  {
    type: 'complexNode',
    label: '复杂节点',
    icon: <Category />,
    color: '#ff5722',
    description: '支持复杂配置的节点',
  },
];
```

### 2. 封装子流程

```typescript
// 1. 选择要封装的节点
const selectedNodes = ['node1', 'node2', 'node3'];

// 2. 使用子流程管理器
<SubworkflowManager
  selectedNodes={selectedNodes}
  onCreateSubworkflow={(definition) => {
    // 处理子流程创建
    console.log('创建子流程:', definition);
  }}
/>

// 3. 生成的子流程可以作为普通节点使用
const subworkflowNode = {
  id: 'subworkflow-1',
  type: 'subworkflow',
  data: {
    subworkflowDefinition: definition,
    // 其他配置...
  }
};
```

### 3. 使用节点模板

```typescript
// 1. 保存节点为模板
<NodeTemplateManager
  currentNode={selectedNode}
  onSaveAsTemplate={(nodeData, templateInfo) => {
    const template: NodeTemplate = {
      ...templateInfo,
      nodeData,
      id: generateId(),
    };
    saveTemplate(template);
  }}
/>

// 2. 应用模板
<NodeTemplateManager
  onApplyTemplate={(template) => {
    const newNode = createNodeFromTemplate(template);
    addNodeToCanvas(newNode);
  }}
/>
```

## 扩展开发

### 1. 自定义参数类型

```typescript
// 扩展参数类型
interface CustomParameterSchema extends ParameterSchema {
  type: 'custom-widget';
  widgetConfig: {
    component: string;
    props: Record<string, any>;
  };
}

// 注册自定义组件
const customWidgets = {
  'custom-widget': CustomWidgetComponent,
};
```

### 2. 自定义端口类型

```typescript
// 定义新的端口类型
interface CustomPort extends AdvancedPort {
  type: 'custom-data';
  schema: {
    format: string;
    validation: any;
  };
}

// 注册端口处理器
const portHandlers = {
  'custom-data': CustomDataPortHandler,
};
```

### 3. 自定义执行引擎

```typescript
// 实现自定义执行引擎
class CustomExecutionEngine {
  async executeSubworkflow(definition: SubworkflowDefinition, inputs: any) {
    // 自定义执行逻辑
    const results = await this.processNodes(definition.nodes, inputs);
    return this.mapOutputs(results, definition.outputMapping);
  }
}
```

## 总结

本实现方案提供了完整的复杂节点设计和子流程封装解决方案：

1. **AdvancedNode**：提供了强大的节点基础架构，支持复杂参数配置
2. **AIModelNode**：展示了如何实现类似ComfyUI的大模型节点
3. **SubworkflowManager**：实现了流程封装的完整工作流
4. **SubworkflowNode**：提供了子流程节点的执行和管理
5. **NodeTemplateManager**：支持节点模板的保存和复用

这套方案具有以下优势：

- **高度可配置**：支持各种复杂的参数配置需求
- **易于扩展**：模块化设计，便于添加新功能
- **用户友好**：提供直观的界面和操作流程
- **性能优化**：支持缓存、重试等性能优化机制
- **调试支持**：提供完整的调试和监控功能

通过这套方案，开发者可以轻松创建复杂的工作流节点，并将复杂的流程封装为可复用的组件，大大提高了工作流的开发效率和可维护性。
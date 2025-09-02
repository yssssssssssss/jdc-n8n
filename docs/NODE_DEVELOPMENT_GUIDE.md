# 节点开发指南

本文档介绍如何在工作流编辑器中添加自定义节点。

## 节点架构概述

工作流编辑器基于ReactFlow框架构建，支持多种类型的自定义节点。所有节点都继承自`CustomNode`基础组件。

## 添加新节点的步骤

### 1. 创建节点组件

在 `src/components/nodes/` 目录下创建新的节点组件文件，例如 `MyCustomNode.tsx`：

```typescript
import React from 'react';
import { NodeProps } from 'reactflow';
import { YourIcon } from '@mui/icons-material';
import CustomNode, { CustomNodeData } from './CustomNode';

interface MyCustomNodeProps extends NodeProps {
  data: CustomNodeData;
}

const MyCustomNode: React.FC<MyCustomNodeProps> = (props) => {
  const nodeData: CustomNodeData = {
    ...props.data,
    label: props.data.label || '自定义节点',
    description: props.data.description || '自定义节点描述',
    icon: <YourIcon />,
    color: '#9c27b0', // 节点主题色
    inputs: [
      {
        id: 'input',
        label: '输入',
        type: 'default',
      },
    ],
    outputs: [
      {
        id: 'output',
        label: '输出',
        type: 'default',
      },
    ],
  };

  return <CustomNode {...props} data={nodeData} />;
};

export default MyCustomNode;
```

### 2. 注册节点类型

在 `src/components/nodes/index.ts` 中导出新节点并添加到类型映射：

```typescript
import MyCustomNode from './MyCustomNode';

export { MyCustomNode };

// 更新节点类型映射
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  condition: ConditionNode,
  custom: CustomNode,
  myCustom: MyCustomNode, // 添加新节点
};
```

### 3. 添加到节点面板

在 `src/components/NodePanel.tsx` 中添加新节点到面板：

```typescript
const nodeTypes = [
  // ... 现有节点
  {
    type: 'myCustom',
    label: '自定义',
    icon: <YourIcon />,
    color: '#9c27b0',
    description: '自定义节点描述',
  },
];
```

### 4. 更新工作流编辑器

在 `src/pages/WorkflowEditor.tsx` 的 `addNode` 函数中添加节点标签：

```typescript
const nodeLabels = {
  start: '开始',
  action: '动作',
  condition: '条件',
  end: '结束',
  myCustom: '自定义', // 添加新节点标签
};
```

## 节点配置规范

### CustomNodeData 接口

```typescript
export interface CustomNodeData {
  label: string;              // 节点显示名称
  description?: string;       // 节点描述
  icon?: React.ReactNode;     // 节点图标
  iconType?: string;          // 图标类型（可选）
  color?: string;             // 节点主题色
  inputs?: Array<{            // 输入端口配置
    id: string;
    label: string;
    type: string;
  }>;
  outputs?: Array<{           // 输出端口配置
    id: string;
    label: string;
    type: string;
  }>;
  config?: Record<string, any>; // 节点配置参数
}
```

### 端口类型说明

- `default`: 默认端口类型
- `success`: 成功输出端口（绿色）
- `error`: 错误输出端口（红色）
- `data`: 数据端口（蓝色）

### 颜色规范

- 开始节点：`#4caf50` (绿色)
- 结束节点：`#f44336` (红色)
- 动作节点：`#2196f3` (蓝色)
- 条件节点：`#ff9800` (橙色)
- 自定义节点：建议使用Material Design色彩

## 节点功能扩展

### 添加自定义属性编辑

可以在 `NodeProperties.tsx` 中为特定节点类型添加专门的属性编辑界面：

```typescript
// 根据节点类型渲染不同的属性编辑器
const renderNodeSpecificProperties = () => {
  switch (selectedNode?.type) {
    case 'myCustom':
      return (
        <Box>
          {/* 自定义属性编辑组件 */}
        </Box>
      );
    default:
      return null;
  }
};
```

### 节点验证

可以为节点添加验证逻辑：

```typescript
const validateNode = (nodeData: CustomNodeData): boolean => {
  // 添加节点特定的验证逻辑
  return true;
};
```

## 最佳实践

1. **命名规范**：使用PascalCase命名节点组件
2. **图标选择**：使用Material-UI图标库中的图标
3. **颜色一致性**：遵循Material Design色彩规范
4. **端口设计**：合理设计输入输出端口，避免过于复杂
5. **文档完善**：为每个节点提供清晰的描述和使用说明
6. **类型安全**：使用TypeScript确保类型安全

## 示例节点

项目中已包含以下示例节点：

- `StartNode`: 工作流开始节点
- `EndNode`: 工作流结束节点
- `ActionNode`: 动作执行节点
- `ConditionNode`: 条件判断节点

可以参考这些节点的实现来创建新的自定义节点。
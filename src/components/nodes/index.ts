import CustomNode, { CustomNodeData } from './CustomNode';
import StartNode from './StartNode';
import EndNode from './EndNode';
import ActionNode from './ActionNode';
import ConditionNode from './ConditionNode';

export { CustomNode, StartNode, EndNode, ActionNode, ConditionNode };
export type { CustomNodeData };

// 节点类型映射
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  condition: ConditionNode,
  custom: CustomNode,
};

// 节点类型定义
export type NodeType = keyof typeof nodeTypes;
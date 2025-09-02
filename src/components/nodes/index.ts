import CustomNode, { CustomNodeData } from './CustomNode';
import StartNode from './StartNode';
import EndNode from './EndNode';
import ActionNode from './ActionNode';
import ConditionNode from './ConditionNode';
import HttpRequestNode from './HttpRequestNode';
import AdvancedNode from './AdvancedNode';
import AIModelNode from './AIModelNode';
import SubworkflowNode from './SubworkflowNode';

export { CustomNode, StartNode, EndNode, ActionNode, ConditionNode, HttpRequestNode, AdvancedNode, AIModelNode, SubworkflowNode };
export type { CustomNodeData };

// 节点类型映射
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  action: ActionNode,
  condition: ConditionNode,
  custom: CustomNode,
  httpRequest: HttpRequestNode,
  advanced: AdvancedNode,
  aiModel: AIModelNode,
  subworkflow: SubworkflowNode,
};

// 节点类型定义
export type NodeType = keyof typeof nodeTypes;
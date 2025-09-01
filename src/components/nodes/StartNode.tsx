import React from 'react';
import { NodeProps } from 'reactflow';
import { PlayArrow } from '@mui/icons-material';
import CustomNode, { CustomNodeData } from './CustomNode';

interface StartNodeProps extends NodeProps {
  data: CustomNodeData;
}

const StartNode: React.FC<StartNodeProps> = (props) => {
  const nodeData: CustomNodeData = {
    ...props.data,
    label: props.data.label || '开始',
    description: props.data.description || '工作流开始节点',
    icon: <PlayArrow />,
    color: '#4caf50',
    inputs: [], // 开始节点没有输入
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

export default StartNode;
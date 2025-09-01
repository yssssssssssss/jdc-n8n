import React from 'react';
import { NodeProps } from 'reactflow';
import { Build } from '@mui/icons-material';
import CustomNode, { CustomNodeData } from './CustomNode';

interface ActionNodeProps extends NodeProps {
  data: CustomNodeData;
}

const ActionNode: React.FC<ActionNodeProps> = (props) => {
  const nodeData: CustomNodeData = {
    ...props.data,
    label: props.data.label || '动作',
    description: props.data.description || '执行具体操作',
    icon: <Build />,
    color: '#2196f3',
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
      {
        id: 'error',
        label: '错误',
        type: 'error',
      },
    ],
  };

  return <CustomNode {...props} data={nodeData} />;
};

export default ActionNode;
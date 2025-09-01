import React from 'react';
import { NodeProps } from 'reactflow';
import { AccountTree } from '@mui/icons-material';
import CustomNode, { CustomNodeData } from './CustomNode';

interface ConditionNodeProps extends NodeProps {
  data: CustomNodeData;
}

const ConditionNode: React.FC<ConditionNodeProps> = (props) => {
  const nodeData: CustomNodeData = {
    ...props.data,
    label: props.data.label || '条件',
    description: props.data.description || '条件判断节点',
    icon: <AccountTree />,
    color: '#ff9800',
    inputs: [
      {
        id: 'input',
        label: '输入',
        type: 'default',
      },
    ],
    outputs: [
      {
        id: 'true',
        label: '真',
        type: 'success',
      },
      {
        id: 'false',
        label: '假',
        type: 'error',
      },
    ],
  };

  return <CustomNode {...props} data={nodeData} />;
};

export default ConditionNode;
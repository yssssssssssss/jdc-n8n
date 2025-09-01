import React from 'react';
import { NodeProps } from 'reactflow';
import { Stop } from '@mui/icons-material';
import CustomNode, { CustomNodeData } from './CustomNode';

interface EndNodeProps extends NodeProps {
  data: CustomNodeData;
}

const EndNode: React.FC<EndNodeProps> = (props) => {
  const nodeData: CustomNodeData = {
    ...props.data,
    label: props.data.label || '结束',
    description: props.data.description || '工作流结束节点',
    icon: <Stop />,
    color: '#f44336',
    inputs: [
      {
        id: 'input',
        label: '输入',
        type: 'default',
      },
    ],
    outputs: [], // 结束节点没有输出
  };

  return <CustomNode {...props} data={nodeData} />;
};

export default EndNode;
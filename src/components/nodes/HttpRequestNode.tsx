import React from 'react';
import { NodeProps } from 'reactflow';
import { Api } from '@mui/icons-material';
import CustomNode, { CustomNodeData } from './CustomNode';

interface HttpRequestNodeProps extends NodeProps {
  data: CustomNodeData;
}

const HttpRequestNode: React.FC<HttpRequestNodeProps> = (props) => {
  const nodeData: CustomNodeData = {
    ...props.data,
    label: props.data.label || 'HTTP请求',
    description: props.data.description || '发送HTTP请求',
    icon: <Api />,
    color: '#673ab7',
    inputs: [
      {
        id: 'input',
        label: '输入数据',
        type: 'object',
      },
    ],
    outputs: [
      {
        id: 'success',
        label: '成功',
        type: 'success',
      },
      {
        id: 'error',
        label: '错误',
        type: 'error',
      },
    ],
    // 默认配置参数
    config: {
      method: 'GET',
      url: '',
      headers: {},
      timeout: 30000,
      ...props.data.config,
    },
  };

  return <CustomNode {...props} data={nodeData} />;
};

export default HttpRequestNode;
import React from 'react';
import { Psychology, Memory, Tune } from '@mui/icons-material';
import AdvancedNode, { AdvancedNodeData, ParameterSchema, AdvancedPort } from './AdvancedNode';

// AI模型节点的参数配置
const aiModelParameters: ParameterSchema[] = [
  {
    name: 'model_type',
    type: 'select',
    label: '模型类型',
    description: '选择要使用的AI模型类型',
    required: true,
    defaultValue: 'text_generation',
    validation: {
      options: [
        { value: 'text_generation', label: '文本生成' },
        { value: 'image_generation', label: '图像生成' },
        { value: 'text_to_image', label: '文本转图像' },
        { value: 'image_to_text', label: '图像转文本' },
        { value: 'embedding', label: '向量嵌入' },
        { value: 'classification', label: '分类模型' }
      ]
    }
  },
  {
    name: 'model_name',
    type: 'select',
    label: '模型名称',
    description: '选择具体的模型',
    required: true,
    defaultValue: 'gpt-3.5-turbo',
    conditional: {
      dependsOn: 'model_type',
      condition: 'equals',
      value: 'text_generation'
    },
    validation: {
      options: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'claude-3', label: 'Claude 3' },
        { value: 'llama-2', label: 'Llama 2' },
        { value: 'custom', label: '自定义模型' }
      ]
    }
  },
  {
    name: 'image_model_name',
    type: 'select',
    label: '图像模型',
    description: '选择图像生成模型',
    required: true,
    defaultValue: 'stable-diffusion-xl',
    conditional: {
      dependsOn: 'model_type',
      condition: 'equals',
      value: 'image_generation'
    },
    validation: {
      options: [
        { value: 'stable-diffusion-xl', label: 'Stable Diffusion XL' },
        { value: 'midjourney', label: 'Midjourney' },
        { value: 'dall-e-3', label: 'DALL-E 3' },
        { value: 'custom-sd', label: '自定义SD模型' }
      ]
    }
  },
  {
    name: 'generation_config',
    type: 'group',
    label: '生成配置',
    description: '模型生成参数配置',
    children: [
      {
        name: 'temperature',
        type: 'slider',
        label: '温度 (Temperature)',
        description: '控制生成内容的随机性，值越高越随机',
        defaultValue: 0.7,
        validation: {
          min: 0,
          max: 2
        }
      },
      {
        name: 'max_tokens',
        type: 'number',
        label: '最大令牌数',
        description: '生成内容的最大长度',
        defaultValue: 1000,
        validation: {
          min: 1,
          max: 4096
        }
      },
      {
        name: 'top_p',
        type: 'slider',
        label: 'Top P',
        description: '核采样参数，控制生成多样性',
        defaultValue: 0.9,
        validation: {
          min: 0,
          max: 1
        }
      },
      {
        name: 'frequency_penalty',
        type: 'slider',
        label: '频率惩罚',
        description: '减少重复内容的生成',
        defaultValue: 0,
        validation: {
          min: -2,
          max: 2
        }
      }
    ]
  },
  {
    name: 'image_config',
    type: 'group',
    label: '图像配置',
    description: '图像生成相关配置',
    conditional: {
      dependsOn: 'model_type',
      condition: 'equals',
      value: 'image_generation'
    },
    children: [
      {
        name: 'width',
        type: 'select',
        label: '图像宽度',
        defaultValue: 1024,
        validation: {
          options: [
            { value: 512, label: '512px' },
            { value: 768, label: '768px' },
            { value: 1024, label: '1024px' },
            { value: 1536, label: '1536px' }
          ]
        }
      },
      {
        name: 'height',
        type: 'select',
        label: '图像高度',
        defaultValue: 1024,
        validation: {
          options: [
            { value: 512, label: '512px' },
            { value: 768, label: '768px' },
            { value: 1024, label: '1024px' },
            { value: 1536, label: '1536px' }
          ]
        }
      },
      {
        name: 'steps',
        type: 'slider',
        label: '采样步数',
        description: '生成质量与速度的平衡',
        defaultValue: 20,
        validation: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'guidance_scale',
        type: 'slider',
        label: '引导强度',
        description: '提示词遵循程度',
        defaultValue: 7.5,
        validation: {
          min: 1,
          max: 20
        }
      },
      {
        name: 'negative_prompt',
        type: 'string',
        label: '负面提示词',
        description: '不希望出现在图像中的内容',
        defaultValue: 'blurry, low quality, distorted'
      }
    ]
  },
  {
    name: 'system_prompt',
    type: 'string',
    label: '系统提示词',
    description: '定义AI助手的角色和行为',
    defaultValue: 'You are a helpful AI assistant.',
    conditional: {
      dependsOn: 'model_type',
      condition: 'equals',
      value: 'text_generation'
    }
  },
  {
    name: 'memory_enabled',
    type: 'boolean',
    label: '启用记忆',
    description: '是否保持对话上下文',
    defaultValue: true
  },
  {
    name: 'memory_length',
    type: 'number',
    label: '记忆长度',
    description: '保持的对话轮数',
    defaultValue: 10,
    conditional: {
      dependsOn: 'memory_enabled',
      condition: 'equals',
      value: true
    },
    validation: {
      min: 1,
      max: 100
    }
  },
  {
    name: 'output_format',
    type: 'select',
    label: '输出格式',
    description: '指定输出内容的格式',
    defaultValue: 'text',
    validation: {
      options: [
        { value: 'text', label: '纯文本' },
        { value: 'json', label: 'JSON格式' },
        { value: 'markdown', label: 'Markdown格式' },
        { value: 'html', label: 'HTML格式' }
      ]
    }
  },
  {
    name: 'custom_headers',
    type: 'json',
    label: '自定义请求头',
    description: 'API请求的自定义头部信息',
    defaultValue: '{}'
  },
  {
    name: 'api_endpoint',
    type: 'string',
    label: 'API端点',
    description: '自定义API服务地址',
    conditional: {
      dependsOn: 'model_name',
      condition: 'equals',
      value: 'custom'
    }
  }
];

// AI模型节点的端口配置
const aiModelInputs: AdvancedPort[] = [
  {
    id: 'prompt',
    name: '提示词',
    type: 'text',
    required: true,
    description: '输入给AI模型的提示内容'
  },
  {
    id: 'image_input',
    name: '输入图像',
    type: 'image',
    required: false,
    description: '用于图像处理的输入图像'
  },
  {
    id: 'context',
    name: '上下文',
    type: 'data',
    required: false,
    description: '额外的上下文信息'
  },
  {
    id: 'control',
    name: '控制信号',
    type: 'control',
    required: false,
    description: '执行控制信号'
  }
];

const aiModelOutputs: AdvancedPort[] = [
  {
    id: 'output',
    name: '生成结果',
    type: 'text',
    description: 'AI模型的生成结果'
  },
  {
    id: 'image_output',
    name: '生成图像',
    type: 'image',
    description: '生成的图像结果'
  },
  {
    id: 'metadata',
    name: '元数据',
    type: 'data',
    description: '生成过程的元数据信息'
  },
  {
    id: 'embedding',
    name: '向量嵌入',
    type: 'data',
    description: '文本的向量表示'
  },
  {
    id: 'error',
    name: '错误输出',
    type: 'control',
    description: '错误信息输出'
  }
];

// AI模型节点数据
const aiModelNodeData: AdvancedNodeData = {
  label: 'AI模型',
  description: '强大的AI模型节点，支持文本生成、图像生成等多种AI任务',
  icon: <Psychology />,
  color: '#673ab7',
  category: 'AI/ML',
  version: '2.1.0',
  inputs: aiModelInputs,
  outputs: aiModelOutputs,
  parameters: aiModelParameters,
  parameterValues: {
    model_type: 'text_generation',
    model_name: 'gpt-3.5-turbo',
    image_model_name: 'dall-e-3',
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
    system_prompt: 'You are a helpful AI assistant.',
    memory_enabled: true,
    memory_length: 10,
    output_format: 'text',
    custom_headers: '{}'
  },
  executionConfig: {
    timeout: 60000,
    retryCount: 3,
    cacheEnabled: true,
    parallelExecution: false
  },
  customRenderer: {
    width: 280,
    height: 120,
    resizable: true
  }
};

// AI模型节点组件
const AIModelNode: React.FC<{ data?: Partial<AdvancedNodeData>; selected?: boolean; id?: string }> = ({ 
  data = {}, 
  selected = false, 
  id = 'ai-model-node' 
}) => {
  const nodeData = { ...aiModelNodeData, ...data };
  
  return <AdvancedNode data={nodeData} selected={selected} id={id} />;
};

export default AIModelNode;
export { aiModelNodeData, aiModelParameters, aiModelInputs, aiModelOutputs };
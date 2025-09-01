import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, IconButton } from '@mui/material';
import { 
  Settings, 
  PlayArrow, 
  Stop, 
  Code, 
  Storage, 
  Api 
} from '@mui/icons-material';

export interface CustomNodeData {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  iconType?: string;
  color?: string;
  inputs?: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  outputs?: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  config?: Record<string, any>;
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData;
}

const getIconByType = (iconType?: string): React.ReactNode => {
  switch (iconType) {
    case 'play':
      return <PlayArrow />;
    case 'stop':
      return <Stop />;
    case 'settings':
      return <Settings />;
    case 'code':
      return <Code />;
    case 'database':
      return <Storage />;
    case 'api':
      return <Api />;
    default:
      return <Settings />;
  }
};

const CustomNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
  const { label, description, icon, iconType, color = '#1976d2', inputs = [], outputs = [] } = data;
  const displayIcon = icon || getIconByType(iconType);

  return (
    <Box
      sx={{
        minWidth: 150,
        minHeight: 60,
        backgroundColor: 'white',
        border: `2px solid ${selected ? '#ff6b35' : color}`,
        borderRadius: 2,
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* 输入端口 */}
      {inputs.map((input, index) => (
        <Handle
          key={`input-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            top: `${40 + index * 25}px`,
            background: '#555',
            width: 8,
            height: 8,
          }}
        />
      ))}

      {/* Node Content */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {displayIcon && (
          <Box
            sx={{
              color: color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {displayIcon}
          </Box>
        )}
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              color: '#333',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
          {description && (
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          sx={{
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 1 },
          }}
        >
          <Settings fontSize="small" />
        </IconButton>
      </Box>

      {/* 输出端口 */}
      {outputs.map((output, index) => (
        <Handle
          key={`output-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            top: `${40 + index * 25}px`,
            background: '#555',
            width: 8,
            height: 8,
          }}
        />
      ))}
    </Box>
  );
};

export default CustomNode;
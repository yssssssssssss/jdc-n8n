import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Build,
  AccountTree,
} from '@mui/icons-material';

interface NodePanelProps {
  onAddNode: (type: string) => void;
}

const NodePanel: React.FC<NodePanelProps> = ({ onAddNode }) => {
  const nodeTypes = [
    {
      type: 'start',
      label: '开始',
      icon: <PlayArrow />,
      color: '#4caf50',
      description: '工作流开始节点',
    },
    {
      type: 'action',
      label: '动作',
      icon: <Build />,
      color: '#2196f3',
      description: '执行具体操作',
    },
    {
      type: 'condition',
      label: '条件',
      icon: <AccountTree />,
      color: '#ff9800',
      description: '条件判断节点',
    },
    {
      type: 'end',
      label: '结束',
      icon: <Stop />,
      color: '#f44336',
      description: '工作流结束节点',
    },
  ];

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 240,
        height: '100%',
        p: 2,
        backgroundColor: '#fafafa',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: '#333',
        }}
      >
        节点面板
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {nodeTypes.map((node) => (
          <Tooltip key={node.type} title={node.description} placement="right">
            <Button
              variant="outlined"
              startIcon={node.icon}
              draggable
              onDragStart={(e) => handleDragStart(e, node.type)}
              onClick={() => onAddNode(node.type)}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderColor: node.color,
                color: node.color,
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: `${node.color}10`,
                  borderColor: node.color,
                },
                '&:active': {
                  transform: 'scale(0.98)',
                  cursor: 'grabbing',
                },
                cursor: 'grab'
              }}
            >
              {node.label}
            </Button>
          </Tooltip>
        ))}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography
        variant="caption"
        sx={{
          color: '#666',
          display: 'block',
          textAlign: 'center',
        }}
      >
        拖拽或点击添加节点
      </Typography>
    </Paper>
  );
};

export default NodePanel;
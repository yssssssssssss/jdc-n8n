import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();



  const handleCreateWorkflow = () => {
    navigate('/workflows/new');
  };

  const handleManageConnections = () => {
    navigate('/credentials');
  };

  const handleViewExecutions = () => {
    navigate('/executions');
  };

  const handleManageCredentials = () => {
    navigate('/credentials');
  };

  return (
    <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          仪表板
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gap: 3, 
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fit, minmax(280px, 1fr))',
            md: 'repeat(auto-fit, minmax(300px, 1fr))'
          }
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                用户信息
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                用户名: {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                邮箱: {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                注册时间: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                工作流管理
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                创建和管理您的自动化工作流
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreateWorkflow}>
                创建工作流
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                数据连接
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                配置和管理数据源连接
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleManageCredentials}>
                管理凭证
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                执行历史
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                查看工作流执行记录和日志
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleViewExecutions}>
                查看历史
              </Button>
            </CardContent>
          </Card>
        </Box>
    </Box>
  );
};

export default Dashboard;
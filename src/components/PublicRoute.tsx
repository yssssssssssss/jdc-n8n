import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Box, CircularProgress } from '@mui/material';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // 如果正在加载认证状态，显示加载指示器
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 如果已认证，重定向到指定页面（默认为仪表板）
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 如果未认证，渲染子组件（登录/注册页面）
  return <>{children}</>;
};

export default PublicRoute;
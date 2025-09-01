import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ProtectedRoute, PublicRoute, Layout } from './components';
import {
  Login,
  Register,
  Dashboard,
  WorkflowList,
  WorkflowEditor,
  CredentialList,
  CredentialEditor,
  ExecutionHistory,
  ExecutionDetail,
} from './pages';
import { useAppStore } from './store';
import { createAppTheme } from './theme';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  const { themeMode } = useAppStore();
  const theme = createAppTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          {/* 默认路由重定向到仪表板 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 公共路由 - 登录和注册 */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* 受保护的路由 - 需要认证 */}
          <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          
          {/* 工作流相关路由 */}
          <Route 
              path="/workflows" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkflowList />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          <Route 
              path="/workflows/new" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkflowEditor />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          <Route 
              path="/workflows/:id/edit" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkflowEditor />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          
          {/* 凭证管理相关路由 */}
          <Route 
              path="/credentials" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CredentialList />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          <Route 
              path="/credentials/new" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CredentialEditor />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          <Route 
              path="/credentials/:id/edit" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <CredentialEditor />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          
          {/* 执行历史相关路由 */}
          <Route 
              path="/executions" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExecutionHistory />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          <Route 
              path="/executions/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExecutionDetail />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          
          {/* 404 页面 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;

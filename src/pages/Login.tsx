import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store';
import { AuthService, LoginRequest } from '../services';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, setLoading, setError, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // 处理输入变化
  const handleInputChange = (field: keyof LoginRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // 清除全局错误
    if (error) {
      clearError();
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    if (!formData.email) {
      errors.email = '请输入邮箱地址';
    } else if (!AuthService.validateEmail(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      errors.password = '请输入密码';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理登录提交
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await AuthService.login(formData);
      navigate('/dashboard'); // 登录成功后跳转到仪表板
    } catch (error: any) {
      // 错误已在AuthService中处理并设置到store
      console.error('登录失败:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              欢迎回来
            </Typography>
            <Typography variant="body2" color="text.secondary">
              请登录您的账户
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="邮箱地址"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '登录'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                还没有账户？{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 'medium',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  立即注册
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
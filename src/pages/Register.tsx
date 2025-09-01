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
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store';
import { AuthService, RegisterRequest } from '../services';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, error, setLoading, setError, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // 处理输入变化
  const handleInputChange = (field: keyof RegisterRequest | 'confirmPassword') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // 清除对应字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // 清除全局错误
    if (error) {
      clearError();
    }
  };

  // 获取密码强度
  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, label: '', color: 'error' as const };
    
    const validation = AuthService.validatePassword(formData.password);
    const strength = Math.max(0, 4 - validation.errors.length);
    
    const strengthMap = {
      0: { label: '很弱', color: 'error' as const },
      1: { label: '弱', color: 'error' as const },
      2: { label: '中等', color: 'warning' as const },
      3: { label: '强', color: 'info' as const },
      4: { label: '很强', color: 'success' as const },
    };
    
    return {
      strength: (strength / 4) * 100,
      ...strengthMap[strength as keyof typeof strengthMap],
    };
  };

  // 表单验证
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    if (!formData.name) {
      errors.name = '请输入姓名';
    } else if (formData.name.length < 2) {
      errors.name = '姓名至少2个字符';
    }
    
    if (!formData.email) {
      errors.email = '请输入邮箱地址';
    } else if (!AuthService.validateEmail(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.password) {
      errors.password = '请输入密码';
    } else {
      const passwordValidation = AuthService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (confirmPassword !== formData.password) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理注册提交
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await AuthService.register(formData);
      navigate('/dashboard'); // 注册成功后跳转到仪表板
    } catch (error: any) {
      // 错误已在AuthService中处理并设置到store
      console.error('注册失败:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

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
          maxWidth: 450,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              创建账户
            </Typography>
            <Typography variant="body2" color="text.secondary">
              请填写以下信息完成注册
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
              label="姓名"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

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

            {formData.password && (
              <Box sx={{ mt: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    密码强度:
                  </Typography>
                  <Chip
                    label={passwordStrength.label}
                    size="small"
                    color={passwordStrength.color}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.strength}
                  color={passwordStrength.color}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="确认密码"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                '注册'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                已有账户？{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 'medium',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  立即登录
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
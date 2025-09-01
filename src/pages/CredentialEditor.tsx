import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  PlayArrow as TestIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CredentialService, Credential, CredentialType, CreateCredentialDto, UpdateCredentialDto } from '../services';

interface CredentialConfig {
  [key: string]: any;
}

interface CredentialField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'url' | 'email';
  required: boolean;
  placeholder?: string;
  description?: string;
}

const CredentialEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: CredentialType.CUSTOM,
    isActive: true,
    config: {} as CredentialConfig,
    encryptedData: {} as CredentialConfig,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 不同凭证类型的配置字段
  const credentialTypeFields: { [key in CredentialType]: CredentialField[] } = {
    [CredentialType.DATABASE]: [
      { key: 'host', label: '主机地址', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: '端口', type: 'number', required: true, placeholder: '3306' },
      { key: 'database', label: '数据库名', type: 'text', required: true },
      { key: 'username', label: '用户名', type: 'text', required: true },
      { key: 'password', label: '密码', type: 'password', required: true },
      { key: 'ssl', label: 'SSL连接', type: 'text', required: false, placeholder: 'true/false' },
    ],
    [CredentialType.API]: [
      { key: 'baseUrl', label: '基础URL', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { key: 'apiKey', label: 'API密钥', type: 'password', required: false },
      { key: 'authType', label: '认证类型', type: 'text', required: false, placeholder: 'Bearer, Basic, etc.' },
      { key: 'timeout', label: '超时时间(ms)', type: 'number', required: false, placeholder: '30000' },
    ],
    [CredentialType.EMAIL]: [
      { key: 'host', label: 'SMTP服务器', type: 'text', required: true, placeholder: 'smtp.gmail.com' },
      { key: 'port', label: '端口', type: 'number', required: true, placeholder: '587' },
      { key: 'username', label: '用户名/邮箱', type: 'email', required: true },
      { key: 'password', label: '密码/应用密码', type: 'password', required: true },
      { key: 'secure', label: '安全连接', type: 'text', required: false, placeholder: 'true/false' },
    ],
    [CredentialType.FTP]: [
      { key: 'host', label: 'FTP服务器', type: 'text', required: true },
      { key: 'port', label: '端口', type: 'number', required: true, placeholder: '21' },
      { key: 'username', label: '用户名', type: 'text', required: true },
      { key: 'password', label: '密码', type: 'password', required: true },
      { key: 'passive', label: '被动模式', type: 'text', required: false, placeholder: 'true/false' },
    ],
    [CredentialType.SSH]: [
      { key: 'host', label: 'SSH服务器', type: 'text', required: true },
      { key: 'port', label: '端口', type: 'number', required: true, placeholder: '22' },
      { key: 'username', label: '用户名', type: 'text', required: true },
      { key: 'password', label: '密码', type: 'password', required: false },
      { key: 'privateKey', label: '私钥', type: 'password', required: false },
    ],
    [CredentialType.WEBHOOK]: [
      { key: 'url', label: 'Webhook URL', type: 'url', required: true },
      { key: 'secret', label: '密钥', type: 'password', required: false },
      { key: 'method', label: 'HTTP方法', type: 'text', required: false, placeholder: 'POST' },
    ],
    [CredentialType.OAUTH]: [
      { key: 'clientId', label: '客户端ID', type: 'text', required: true },
      { key: 'clientSecret', label: '客户端密钥', type: 'password', required: true },
      { key: 'authUrl', label: '授权URL', type: 'url', required: true },
      { key: 'tokenUrl', label: '令牌URL', type: 'url', required: true },
      { key: 'scope', label: '权限范围', type: 'text', required: false },
    ],
    [CredentialType.CUSTOM]: [],
  };

  useEffect(() => {
    if (isEditMode && id) {
      fetchCredential();
    }
  }, [id, isEditMode]);

  const fetchCredential = async () => {
    try {
      setLoading(true);
      const data = await CredentialService.getById(id!);
      setCredential(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        type: data.type,
        isActive: data.isActive,
        config: data.config || {},
        encryptedData: data.encryptedData || {},
      });
    } catch (error) {
      console.error('获取凭证失败:', error);
      toast.error('获取凭证失败');
      navigate('/credentials');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '凭证名称不能为空';
    }

    const fields = credentialTypeFields[formData.type];
    fields.forEach(field => {
      if (field.required) {
        const value = field.type === 'password' 
          ? formData.encryptedData[field.key] 
          : formData.config[field.key];
        
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.key] = `${field.label}不能为空`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('请填写必填字段');
      return;
    }

    setSaving(true);
    try {
      const credentialData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        config: formData.config,
        encryptedData: formData.encryptedData,
        isActive: formData.isActive,
      };

      if (isEditMode && id) {
        await CredentialService.update(id, credentialData as UpdateCredentialDto);
        toast.success('凭证更新成功');
      } else {
        await CredentialService.create(credentialData as CreateCredentialDto);
        toast.success('凭证创建成功');
      }
      
      navigate('/credentials');
    } catch (error) {
      console.error('保存凭证失败:', error);
      toast.error('保存凭证失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!isEditMode || !id) {
      toast.error('请先保存凭证后再测试');
      return;
    }

    setTesting(true);
    try {
      const result = await CredentialService.testConnection(id);
      if (result.success) {
        toast.success('连接测试成功');
      } else {
        toast.error(`连接测试失败: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      toast.error('测试连接失败');
    } finally {
      setTesting(false);
    }
  };

  const handleFieldChange = (field: CredentialField, value: any) => {
    if (field.type === 'password') {
      setFormData(prev => ({
        ...prev,
        encryptedData: {
          ...prev.encryptedData,
          [field.key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [field.key]: value
        }
      }));
    }

    // 清除错误
    if (errors[field.key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.key];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const renderField = (field: CredentialField) => {
    const value = field.type === 'password' 
      ? formData.encryptedData[field.key] || ''
      : formData.config[field.key] || '';
    
    const isPassword = field.type === 'password';
    const showPassword = showPasswords[field.key];

    return (
      <Grid item xs={12} sm={6} key={field.key}>
        <TextField
          fullWidth
          label={field.label}
          type={isPassword && !showPassword ? 'password' : field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          error={!!errors[field.key]}
          helperText={errors[field.key] || field.description}
          InputProps={isPassword ? {
            endAdornment: (
              <IconButton
                onClick={() => togglePasswordVisibility(field.key)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            )
          } : undefined}
        />
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/credentials')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? '编辑凭证' : '创建凭证'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* 基本信息 */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="凭证名称"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>凭证类型</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      type: e.target.value as CredentialType,
                      config: {},
                      encryptedData: {}
                    }));
                    setErrors({});
                  }}
                  label="凭证类型"
                >
                  <MenuItem value={CredentialType.DATABASE}>数据库</MenuItem>
                  <MenuItem value={CredentialType.API}>API</MenuItem>
                  <MenuItem value={CredentialType.EMAIL}>邮件</MenuItem>
                  <MenuItem value={CredentialType.FTP}>FTP</MenuItem>
                  <MenuItem value={CredentialType.SSH}>SSH</MenuItem>
                  <MenuItem value={CredentialType.WEBHOOK}>Webhook</MenuItem>
                  <MenuItem value={CredentialType.OAUTH}>OAuth</MenuItem>
                  <MenuItem value={CredentialType.CUSTOM}>自定义</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
                placeholder="可选：描述此凭证的用途"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label="启用此凭证"
              />
            </Grid>

            {/* 配置字段 */}
            {credentialTypeFields[formData.type].length > 0 && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    配置信息
                  </Typography>
                </Grid>
                
                {credentialTypeFields[formData.type].map(renderField)}
              </>
            )}

            {/* 自定义配置 */}
            {formData.type === CredentialType.CUSTOM && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">自定义配置</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        自定义凭证类型允许您配置任意的键值对。请根据您的具体需求添加配置项。
                      </Alert>
                      <TextField
                        fullWidth
                        label="配置 (JSON格式)"
                        value={JSON.stringify({ ...formData.config, ...formData.encryptedData }, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              config: parsed,
                              encryptedData: {}
                            }));
                          } catch (error) {
                            // 忽略JSON解析错误，让用户继续编辑
                          }
                        }}
                        multiline
                        rows={6}
                        placeholder='{ "key": "value" }'
                      />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="outlined"
          onClick={() => navigate('/credentials')}
        >
          取消
        </Button>
        
        <Box display="flex" gap={2}>
          {isEditMode && (
            <Button
              variant="outlined"
              startIcon={testing ? <CircularProgress size={20} /> : <TestIcon />}
              onClick={handleTest}
              disabled={testing}
            >
              测试连接
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {isEditMode ? '更新' : '创建'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CredentialEditor;
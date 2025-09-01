import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CredentialService, Credential, CredentialType } from '../services';

const CredentialList: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<Credential | null>(null);
  const [testingCredentials, setTestingCredentials] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    fetchCredentials();
  }, [pagination.page]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await CredentialService.getAll(pagination.page, pagination.limit);
      setCredentials(response.credentials);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / pagination.limit)
      }));
    } catch (error) {
      console.error('获取凭证列表失败:', error);
      toast.error('获取凭证列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = () => {
    navigate('/credentials/new');
  };

  const handleEditCredential = (credential: Credential) => {
    navigate(`/credentials/${credential.id}/edit`);
  };

  const handleDeleteCredential = (credential: Credential) => {
    setCredentialToDelete(credential);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!credentialToDelete) return;

    try {
      await CredentialService.delete(credentialToDelete.id);
      toast.success('凭证删除成功');
      fetchCredentials();
    } catch (error) {
      console.error('删除凭证失败:', error);
      toast.error('删除凭证失败');
    } finally {
      setDeleteDialogOpen(false);
      setCredentialToDelete(null);
    }
  };

  const handleTestCredential = async (credential: Credential) => {
    setTestingCredentials(prev => new Set(prev).add(credential.id));
    handleMenuClose();

    try {
      const result = await CredentialService.testConnection(credential.id);
      if (result.success) {
        toast.success('连接测试成功');
      } else {
        toast.error(`连接测试失败: ${result.error || result.message}`);
      }
      // 重新获取凭证列表以更新测试状态
      fetchCredentials();
    } catch (error) {
      console.error('测试连接失败:', error);
      toast.error('测试连接失败');
    } finally {
      setTestingCredentials(prev => {
        const newSet = new Set(prev);
        newSet.delete(credential.id);
        return newSet;
      });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, credential: Credential) => {
    setAnchorEl(event.currentTarget);
    setSelectedCredential(credential);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCredential(null);
  };

  const getCredentialTypeLabel = (type: CredentialType): string => {
    const typeLabels = {
      [CredentialType.DATABASE]: '数据库',
      [CredentialType.API]: 'API',
      [CredentialType.EMAIL]: '邮件',
      [CredentialType.FTP]: 'FTP',
      [CredentialType.SSH]: 'SSH',
      [CredentialType.WEBHOOK]: 'Webhook',
      [CredentialType.OAUTH]: 'OAuth',
      [CredentialType.CUSTOM]: '自定义'
    };
    return typeLabels[type] || type;
  };

  const getCredentialTypeColor = (type: CredentialType) => {
    const typeColors = {
      [CredentialType.DATABASE]: 'primary',
      [CredentialType.API]: 'secondary',
      [CredentialType.EMAIL]: 'info',
      [CredentialType.FTP]: 'warning',
      [CredentialType.SSH]: 'error',
      [CredentialType.WEBHOOK]: 'success',
      [CredentialType.OAUTH]: 'default',
      [CredentialType.CUSTOM]: 'default'
    };
    return typeColors[type] || 'default';
  };

  const getTestStatusIcon = (credential: Credential) => {
    if (testingCredentials.has(credential.id)) {
      return <CircularProgress size={20} />;
    }
    
    if (!credential.lastTestedAt) {
      return (
        <Tooltip title="未测试">
          <ScheduleIcon color="disabled" />
        </Tooltip>
      );
    }
    
    if (credential.testPassed) {
      return (
        <Tooltip title={`测试通过 - ${new Date(credential.lastTestedAt).toLocaleString()}`}>
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title={`测试失败: ${credential.testError} - ${new Date(credential.lastTestedAt).toLocaleString()}`}>
          <ErrorIcon color="error" />
        </Tooltip>
      );
    }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          凭证管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCredential}
        >
          创建凭证
        </Button>
      </Box>

      {credentials.length === 0 ? (
        <Alert severity="info">
          暂无凭证，点击"创建凭证"按钮开始创建您的第一个凭证。
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {credentials.map((credential) => (
            <Grid item xs={12} sm={6} md={4} key={credential.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2" noWrap>
                      {credential.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getTestStatusIcon(credential)}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, credential)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Chip
                    label={getCredentialTypeLabel(credential.type)}
                    color={getCredentialTypeColor(credential.type) as any}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  {credential.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {credential.description}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={credential.isActive ? '启用' : '禁用'}
                      color={credential.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(credential.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            上一页
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            {pagination.page} / {pagination.totalPages}
          </Typography>
          <Button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            下一页
          </Button>
        </Box>
      )}

      {/* 操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedCredential && handleTestCredential(selectedCredential)}>
          <TestIcon sx={{ mr: 1 }} />
          测试连接
        </MenuItem>
        <MenuItem onClick={() => selectedCredential && handleEditCredential(selectedCredential)}>
          <EditIcon sx={{ mr: 1 }} />
          编辑
        </MenuItem>
        <MenuItem onClick={() => selectedCredential && handleDeleteCredential(selectedCredential)}>
          <DeleteIcon sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除凭证 "{credentialToDelete?.name}" 吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CredentialList;
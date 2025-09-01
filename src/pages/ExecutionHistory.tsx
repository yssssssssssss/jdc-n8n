import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Pagination,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ExecutionService, type Execution, ExecutionStatus } from '../services';

const statusColors = {
  [ExecutionStatus.PENDING]: 'default',
  [ExecutionStatus.RUNNING]: 'info',
  [ExecutionStatus.SUCCESS]: 'success',
  [ExecutionStatus.FAILED]: 'error',
  [ExecutionStatus.CANCELLED]: 'warning',
} as const;

const statusLabels = {
  [ExecutionStatus.PENDING]: '等待中',
  [ExecutionStatus.RUNNING]: '运行中',
  [ExecutionStatus.SUCCESS]: '成功',
  [ExecutionStatus.FAILED]: '失败',
  [ExecutionStatus.CANCELLED]: '已取消',
};

interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  pending: number;
}

const ExecutionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    workflowId: '',
    status: '' as ExecutionStatus | '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState<number | null>(null);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await ExecutionService.getAll(
        page,
        20,
        filters.workflowId ? parseInt(filters.workflowId) : undefined,
        filters.status || undefined
      );
      setExecutions(response.executions);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await ExecutionService.getStats(
        filters.workflowId ? parseInt(filters.workflowId) : undefined
      );
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchExecutions();
    fetchStats();
  }, [page, filters]);

  const handleViewExecution = (id: number) => {
    navigate(`/executions/${id}`);
  };

  const handleDeleteExecution = async () => {
    if (!executionToDelete) return;

    try {
      await ExecutionService.delete(executionToDelete);
      setDeleteDialogOpen(false);
      setExecutionToDelete(null);
      fetchExecutions();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete execution:', error);
    }
  };

  const handleCancelExecution = async (id: number) => {
    try {
      await ExecutionService.cancel(id);
      fetchExecutions();
      fetchStats();
    } catch (error) {
      console.error('Failed to cancel execution:', error);
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          执行历史
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchExecutions();
            fetchStats();
          }}
        >
          刷新
        </Button>
      </Box>

      {/* 统计卡片 */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  总计
                </Typography>
                <Typography variant="h5">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  成功
                </Typography>
                <Typography variant="h5" color="success.main">
                  {stats.success}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  失败
                </Typography>
                <Typography variant="h5" color="error.main">
                  {stats.failed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  运行中
                </Typography>
                <Typography variant="h5" color="info.main">
                  {stats.running}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  等待中
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 过滤器 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="工作流ID"
          value={filters.workflowId}
          onChange={(e) => setFilters({ ...filters, workflowId: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          select
          label="状态"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as ExecutionStatus | '' })}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">全部</MenuItem>
          {Object.values(ExecutionStatus).map((status) => (
            <MenuItem key={status} value={status}>
              {statusLabels[status]}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* 执行历史表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>工作流ID</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>触发类型</TableCell>
              <TableCell>开始时间</TableCell>
              <TableCell>结束时间</TableCell>
              <TableCell>执行时长</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : executions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  暂无执行记录
                </TableCell>
              </TableRow>
            ) : (
              executions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>{execution.id}</TableCell>
                  <TableCell>{execution.workflowId}</TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[execution.status]}
                      color={statusColors[execution.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{execution.triggerType || '-'}</TableCell>
                  <TableCell>
                    {execution.startedAt ? formatDate(execution.startedAt) : '-'}
                  </TableCell>
                  <TableCell>
                    {execution.finishedAt ? formatDate(execution.finishedAt) : '-'}
                  </TableCell>
                  <TableCell>{formatDuration(execution.duration)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewExecution(execution.id)}
                      title="查看详情"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {execution.status === ExecutionStatus.RUNNING && (
                      <IconButton
                        size="small"
                        onClick={() => handleCancelExecution(execution.id)}
                        title="取消执行"
                      >
                        <StopIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setExecutionToDelete(execution.id);
                        setDeleteDialogOpen(true);
                      }}
                      title="删除"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除这个执行记录吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteExecution} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExecutionHistory;
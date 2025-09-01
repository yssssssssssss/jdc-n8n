import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
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

const ExecutionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExecution = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const executionData = await ExecutionService.getById(parseInt(id));
      setExecution(executionData);
    } catch (err) {
      setError('获取执行详情失败');
      console.error('Failed to fetch execution:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();
  }, [id]);

  const handleCancelExecution = async () => {
    if (!execution) return;

    try {
      await ExecutionService.cancel(execution.id);
      fetchExecution(); // 重新获取数据
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

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN');
  };

  const formatJson = (jsonString?: string) => {
    if (!jsonString) return null;
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !execution) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || '执行记录不存在'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/executions')}
          sx={{ mt: 2 }}
        >
          返回执行历史
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 头部 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/executions')}
          >
            返回
          </Button>
          <Typography variant="h4" component="h1">
            执行详情 #{execution.id}
          </Typography>
          <Chip
            label={statusLabels[execution.status]}
            color={statusColors[execution.status]}
            size="medium"
          />
        </Box>
        <Box>
          {execution.status === ExecutionStatus.RUNNING && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleCancelExecution}
            >
              取消执行
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 基本信息 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    执行ID
                  </Typography>
                  <Typography variant="body1">
                    {execution.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    工作流ID
                  </Typography>
                  <Typography variant="body1">
                    {execution.workflowId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    触发类型
                  </Typography>
                  <Typography variant="body1">
                    {execution.triggerType || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    执行时长
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(execution.duration)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 时间信息 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                时间信息
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    创建时间
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(execution.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    开始时间
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(execution.startedAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    结束时间
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(execution.finishedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 错误信息 */}
        {execution.errorMessage && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  错误信息
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Alert severity="error">
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {execution.errorMessage}
                  </pre>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 输入数据 */}
        {execution.inputData && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">输入数据</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {formatJson(execution.inputData)}
                  </pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* 输出数据 */}
        {execution.outputData && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">输出数据</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {formatJson(execution.outputData)}
                  </pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {/* 执行日志 */}
        {execution.logs && (
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">执行日志</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {formatJson(execution.logs)}
                  </pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ExecutionDetail;
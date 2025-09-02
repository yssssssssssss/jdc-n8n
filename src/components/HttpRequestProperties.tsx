import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Delete,
} from '@mui/icons-material';
import { CustomNodeData } from './nodes/CustomNode';

interface HttpRequestPropertiesProps {
  nodeData: CustomNodeData;
  onUpdateConfig: (config: Record<string, any>) => void;
}

const HttpRequestProperties: React.FC<HttpRequestPropertiesProps> = ({
  nodeData,
  onUpdateConfig,
}) => {
  const config = nodeData.config || {};

  const handleConfigChange = (key: string, value: any) => {
    const updatedConfig = { ...config, [key]: value };
    onUpdateConfig(updatedConfig);
  };

  const addHeader = () => {
    const headers = config.headers || {};
    const newKey = `header_${Object.keys(headers).length + 1}`;
    handleConfigChange('headers', { ...headers, [newKey]: '' });
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const headers = { ...config.headers };
    if (oldKey !== newKey) {
      delete headers[oldKey];
    }
    headers[newKey] = value;
    handleConfigChange('headers', headers);
  };

  const removeHeader = (key: string) => {
    const headers = { ...config.headers };
    delete headers[key];
    handleConfigChange('headers', headers);
  };

  return (
    <Box>
      {/* HTTP方法配置 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">请求配置</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>HTTP方法</InputLabel>
              <Select
                value={config.method || 'GET'}
                label="HTTP方法"
                onChange={(e) => handleConfigChange('method', e.target.value)}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
                <MenuItem value="HEAD">HEAD</MenuItem>
                <MenuItem value="OPTIONS">OPTIONS</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="请求URL"
              value={config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              size="small"
              fullWidth
              placeholder="https://api.example.com/data"
            />

            <TextField
              label="超时时间(毫秒)"
              type="number"
              value={config.timeout || 30000}
              onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
              size="small"
              fullWidth
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 请求头配置 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">请求头</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(config.headers || {}).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Header名称"
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, value as string)}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="Content-Type"
                />
                <TextField
                  label="Header值"
                  value={value as string}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="application/json"
                />
                <IconButton
                  size="small"
                  onClick={() => removeHeader(key)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
            
            <Button
              startIcon={<Add />}
              onClick={addHeader}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              添加请求头
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 请求体配置 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">请求体</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>内容类型</InputLabel>
              <Select
                value={config.bodyType || 'json'}
                label="内容类型"
                onChange={(e) => handleConfigChange('bodyType', e.target.value)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="form">Form Data</MenuItem>
                <MenuItem value="text">Plain Text</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="请求体内容"
              value={config.body || ''}
              onChange={(e) => handleConfigChange('body', e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={4}
              placeholder={config.bodyType === 'json' ? '{\n  "key": "value"\n}' : '请输入请求体内容'}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 认证配置 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">认证配置</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>认证类型</InputLabel>
              <Select
                value={config.authType || 'none'}
                label="认证类型"
                onChange={(e) => handleConfigChange('authType', e.target.value)}
              >
                <MenuItem value="none">无认证</MenuItem>
                <MenuItem value="bearer">Bearer Token</MenuItem>
                <MenuItem value="basic">Basic Auth</MenuItem>
                <MenuItem value="apikey">API Key</MenuItem>
              </Select>
            </FormControl>

            {config.authType === 'bearer' && (
              <TextField
                label="Bearer Token"
                value={config.bearerToken || ''}
                onChange={(e) => handleConfigChange('bearerToken', e.target.value)}
                size="small"
                fullWidth
                type="password"
              />
            )}

            {config.authType === 'basic' && (
              <>
                <TextField
                  label="用户名"
                  value={config.username || ''}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="密码"
                  value={config.password || ''}
                  onChange={(e) => handleConfigChange('password', e.target.value)}
                  size="small"
                  fullWidth
                  type="password"
                />
              </>
            )}

            {config.authType === 'apikey' && (
              <>
                <TextField
                  label="API Key名称"
                  value={config.apiKeyName || ''}
                  onChange={(e) => handleConfigChange('apiKeyName', e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="X-API-Key"
                />
                <TextField
                  label="API Key值"
                  value={config.apiKeyValue || ''}
                  onChange={(e) => handleConfigChange('apiKeyValue', e.target.value)}
                  size="small"
                  fullWidth
                  type="password"
                />
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 响应处理 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle2">响应处理</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>响应格式</InputLabel>
              <Select
                value={config.responseType || 'json'}
                label="响应格式"
                onChange={(e) => handleConfigChange('responseType', e.target.value)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
                <MenuItem value="binary">Binary</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="成功状态码"
              value={config.successCodes || '200,201,202,204'}
              onChange={(e) => handleConfigChange('successCodes', e.target.value)}
              size="small"
              fullWidth
              placeholder="200,201,202,204"
              helperText="用逗号分隔多个状态码"
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default HttpRequestProperties;
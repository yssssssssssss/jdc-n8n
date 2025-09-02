import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Rating,
  Tooltip,
  Menu,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Download,
  Upload,
  Share,
  Star,
  StarBorder,
  MoreVert,
  Visibility,
  FileCopy,
  Category,
  Person,
  Schedule,
  ExpandMore,
  Search,
  FilterList,
  Sort,
  CloudUpload,
  CloudDownload,
} from '@mui/icons-material';
import { Node } from 'reactflow';
import { AdvancedNodeData } from './nodes/AdvancedNode';
import { SubworkflowDefinition } from './SubworkflowManager';

// 节点模板接口
export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  nodeType: string;
  nodeData: AdvancedNodeData;
  previewImage?: string;
  metadata: {
    author: string;
    authorAvatar?: string;
    createdAt: Date;
    updatedAt: Date;
    downloads: number;
    rating: number;
    ratingCount: number;
    isPublic: boolean;
    isFeatured: boolean;
    license: string;
    dependencies: string[];
    compatibility: string[];
  };
  configuration: {
    defaultParameters: Record<string, any>;
    requiredParameters: string[];
    optionalParameters: string[];
    parameterGroups: Array<{
      name: string;
      parameters: string[];
      collapsed?: boolean;
    }>;
  };
  examples: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
    expectedOutput?: any;
  }>;
}

// 模板分类
interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  templateCount: number;
}

interface NodeTemplateManagerProps {
  currentNode?: Node;
  onApplyTemplate: (template: NodeTemplate) => void;
  onSaveAsTemplate: (nodeData: AdvancedNodeData, templateInfo: Partial<NodeTemplate>) => void;
  existingTemplates: NodeTemplate[];
  categories: TemplateCategory[];
}

const NodeTemplateManager: React.FC<NodeTemplateManagerProps> = ({
  currentNode,
  onApplyTemplate,
  onSaveAsTemplate,
  existingTemplates,
  categories,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'downloads' | 'date'>('rating');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTemplateDetails, setShowTemplateDetails] = useState<NodeTemplate | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NodeTemplate | null>(null);
  
  // 新模板表单数据
  const [newTemplate, setNewTemplate] = useState<Partial<NodeTemplate>>({
    name: '',
    description: '',
    category: 'Custom',
    tags: [],
    version: '1.0.0',
    metadata: {
      author: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      isPublic: false,
      isFeatured: false,
      license: 'MIT',
      dependencies: [],
      compatibility: [],
    },
    configuration: {
      defaultParameters: {},
      requiredParameters: [],
      optionalParameters: [],
      parameterGroups: [],
    },
    examples: [],
  });

  // 加载收藏列表
  useEffect(() => {
    const savedFavorites = localStorage.getItem('nodeTemplateFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // 保存收藏列表
  const saveFavorites = useCallback((newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('nodeTemplateFavorites', JSON.stringify(newFavorites));
  }, []);

  // 切换收藏状态
  const toggleFavorite = useCallback((templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // 过滤和排序模板
  const filteredTemplates = useCallback(() => {
    let filtered = existingTemplates;
    
    // 按分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    // 按搜索查询过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.metadata.rating - a.metadata.rating;
        case 'downloads':
          return b.metadata.downloads - a.metadata.downloads;
        case 'date':
          return b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [existingTemplates, selectedCategory, searchQuery, sortBy]);

  // 应用模板
  const handleApplyTemplate = useCallback((template: NodeTemplate) => {
    onApplyTemplate(template);
    setOpen(false);
  }, [onApplyTemplate]);

  // 保存为模板
  const handleSaveAsTemplate = useCallback(() => {
    if (!currentNode) return;
    
    const templateData: Partial<NodeTemplate> = {
      ...newTemplate,
      nodeType: currentNode.type || 'custom',
      nodeData: currentNode.data as AdvancedNodeData,
    };
    
    onSaveAsTemplate(currentNode.data as AdvancedNodeData, templateData);
    setShowSaveDialog(false);
    setNewTemplate({
      name: '',
      description: '',
      category: 'Custom',
      tags: [],
      version: '1.0.0',
      metadata: {
        author: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        isPublic: false,
        isFeatured: false,
        license: 'MIT',
        dependencies: [],
        compatibility: [],
      },
      configuration: {
        defaultParameters: {},
        requiredParameters: [],
        optionalParameters: [],
        parameterGroups: [],
      },
      examples: [],
    });
  }, [currentNode, newTemplate, onSaveAsTemplate]);

  // 导出模板
  const exportTemplate = useCallback((template: NodeTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // 导入模板
  const importTemplate = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string) as NodeTemplate;
        // 这里应该调用父组件的导入方法
        console.log('导入模板:', template);
      } catch (error) {
        console.error('导入模板失败:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // 渲染模板卡片
  const renderTemplateCard = (template: NodeTemplate) => (
    <Card key={template.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" noWrap>
            {template.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => toggleFavorite(template.id)}
              color={favorites.includes(template.id) ? 'warning' : 'default'}
            >
              {favorites.includes(template.id) ? <Star /> : <StarBorder />}
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                setSelectedTemplate(template);
                setAnchorEl(e.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {template.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating value={template.metadata.rating} readOnly size="small" />
          <Typography variant="caption" color="text.secondary">
            ({template.metadata.ratingCount})
          </Typography>
          <Chip label={template.category} size="small" variant="outlined" />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {template.tags.slice(0, 3).map(tag => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
          {template.tags.length > 3 && (
            <Chip label={`+${template.tags.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24 }}>
            {template.metadata.author[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {template.metadata.author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • {template.metadata.downloads} 下载
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          onClick={() => handleApplyTemplate(template)}
          variant="contained"
          fullWidth
        >
          应用模板
        </Button>
        <Button
          size="small"
          onClick={() => setShowTemplateDetails(template)}
          variant="outlined"
        >
          详情
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Button
        startIcon={<Category />}
        onClick={() => setOpen(true)}
        variant="outlined"
      >
        节点模板
      </Button>
      
      {currentNode && (
        <Button
          startIcon={<Save />}
          onClick={() => setShowSaveDialog(true)}
          variant="outlined"
          sx={{ ml: 1 }}
        >
          保存为模板
        </Button>
      )}
      
      {/* 主对话框 */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">节点模板库</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-template-file"
                type="file"
                onChange={importTemplate}
              />
              <label htmlFor="import-template-file">
                <Button
                  component="span"
                  startIcon={<CloudUpload />}
                  size="small"
                  variant="outlined"
                >
                  导入
                </Button>
              </label>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="浏览模板" />
            <Tab label="我的模板" />
            <Tab label="收藏夹" />
          </Tabs>
          
          {/* 过滤和搜索 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="搜索模板..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>分类</InputLabel>
              <Select
                value={selectedCategory}
                label="分类"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">全部</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} ({category.templateCount})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>排序</InputLabel>
              <Select
                value={sortBy}
                label="排序"
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <MenuItem value="rating">评分</MenuItem>
                <MenuItem value="downloads">下载量</MenuItem>
                <MenuItem value="date">更新时间</MenuItem>
                <MenuItem value="name">名称</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* 模板网格 */}
          <Grid container spacing={2}>
            {filteredTemplates().map(template => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                {renderTemplateCard(template)}
              </Grid>
            ))}
          </Grid>
          
          {filteredTemplates().length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                没有找到匹配的模板
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
      
      {/* 保存模板对话框 */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>保存为模板</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="模板名称"
              value={newTemplate.name || ''}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            
            <TextField
              label="描述"
              value={newTemplate.description || ''}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>分类</InputLabel>
                <Select
                  value={newTemplate.category || ''}
                  label="分类"
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="版本"
                value={newTemplate.version || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, version: e.target.value }))}
                sx={{ flex: 1 }}
              />
            </Box>
            
            <TextField
              label="标签 (用逗号分隔)"
              value={newTemplate.tags?.join(', ') || ''}
              onChange={(e) => setNewTemplate(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              fullWidth
              placeholder="AI, 数据处理, 工具"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>取消</Button>
          <Button onClick={handleSaveAsTemplate} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
      
      {/* 模板详情对话框 */}
      {showTemplateDetails && (
        <Dialog
          open={Boolean(showTemplateDetails)}
          onClose={() => setShowTemplateDetails(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{showTemplateDetails.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography>{showTemplateDetails.description}</Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>配置参数</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    必需参数: {showTemplateDetails.configuration.requiredParameters.join(', ') || '无'}
                  </Typography>
                  <Typography variant="body2">
                    可选参数: {showTemplateDetails.configuration.optionalParameters.join(', ') || '无'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>使用示例</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {showTemplateDetails.examples.map((example, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">{example.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {example.description}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => exportTemplate(showTemplateDetails)} startIcon={<CloudDownload />}>
              导出
            </Button>
            <Button onClick={() => handleApplyTemplate(showTemplateDetails)} variant="contained">
              应用模板
            </Button>
            <Button onClick={() => setShowTemplateDetails(null)}>关闭</Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* 模板操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && Boolean(selectedTemplate)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedTemplate(null);
        }}
      >
        <MenuItem onClick={() => {
          if (selectedTemplate) {
            setShowTemplateDetails(selectedTemplate);
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon><Visibility /></ListItemIcon>
          查看详情
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTemplate) {
            exportTemplate(selectedTemplate);
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon><CloudDownload /></ListItemIcon>
          导出模板
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTemplate) {
            navigator.clipboard.writeText(JSON.stringify(selectedTemplate, null, 2));
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon><FileCopy /></ListItemIcon>
          复制配置
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NodeTemplateManager;
export type { NodeTemplate, TemplateCategory };
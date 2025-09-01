import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Key as KeyIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: '仪表板',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: '工作流',
      path: '/workflows',
      icon: <WorkIcon />,
    },
    {
      label: '凭证',
      path: '/credentials',
      icon: <KeyIcon />,
    },
    {
      label: '执行历史',
      path: '/executions',
      icon: <HistoryIcon />,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          JDC-N8N
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                mr: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name || user?.email}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {user?.avatar ? (
              <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              退出登录
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
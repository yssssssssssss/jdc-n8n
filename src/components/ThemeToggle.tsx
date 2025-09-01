import React from 'react';
import {
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAppStore } from '../store';

const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useAppStore();

  return (
    <Tooltip title={themeMode === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="切换主题"
      >
        {themeMode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
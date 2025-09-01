import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// 自定义颜色调色板
const colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
};

// 响应式断点配置
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// 字体配置
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
};

// 组件样式覆盖
const getComponents = (mode: PaletteMode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        borderRadius: 8,
        fontWeight: 500,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'light' 
          ? '0 2px 8px rgba(0,0,0,0.1)' 
          : '0 2px 8px rgba(0,0,0,0.3)',
        '&:hover': {
          boxShadow: mode === 'light'
            ? '0 4px 16px rgba(0,0,0,0.15)'
            : '0 4px 16px rgba(0,0,0,0.4)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
});

// 创建主题函数
export const createAppTheme = (mode: PaletteMode): Theme => {
  return createTheme({
    palette: {
      mode,
      ...colors,
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#b3b3b3',
      },
    },
    breakpoints,
    typography,
    components: getComponents(mode),
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
  });
};

// 默认主题
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

export default createAppTheme;
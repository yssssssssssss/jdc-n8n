import React from 'react';
import { Box, Container } from '@mui/material';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const Layout: React.FC<LayoutProps> = ({ children, maxWidth = 'lg' }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Container maxWidth={maxWidth} sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
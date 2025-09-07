// src/layouts/MainLayout.tsx
import React from 'react';
import { Box, useTheme, AppBar, Toolbar } from '@mui/material';
import TopNavBar from '@/components/TopNavBar/TopNavBar';
import { Outlet } from 'react-router';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const drawerHeight = theme.layout?.drawerHeight || 64;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* TopBar: full width, content aligned with main content */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          height: drawerHeight,
          justifyContent: 'center',
        }}
      >
        <Toolbar
          disableGutters
          sx={{ minHeight: drawerHeight, height: drawerHeight }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1024,
              minWidth: 320,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              px: 2,
            }}
          >
            <TopNavBar />
          </Box>
        </Toolbar>
      </AppBar>
      {/* Centered Content */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 1024,
          minWidth: 320,
          margin: '32px auto 0 auto',
          padding: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

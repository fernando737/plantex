// src/layouts/AuthLayout.tsx
import React from 'react';
import { Box, Paper, useTheme } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: theme.spacing(4),
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          borderRadius: theme.shape.borderRadius,
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default AuthLayout;

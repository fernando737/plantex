import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { designTokens } from '@/config';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'inherit';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
  className,
  variant = 'primary',
}) => {
  const theme = useTheme();

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={designTokens.spacing.md}
      className={className}
      sx={{
        padding: designTokens.spacing.lg,
      }}
    >
      <CircularProgress
        size={sizeMap[size]}
        color={variant}
        sx={{
          color:
            variant === 'primary'
              ? designTokens.colors.primary[500]
              : variant === 'secondary'
                ? designTokens.colors.secondary[500]
                : 'inherit',
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: designTokens.typography.fontWeight.medium,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
        role="alert"
        aria-live="polite"
        aria-label="Loading content"
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;

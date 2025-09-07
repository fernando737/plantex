// src/config/themeExamples.tsx
// Examples of how to use the centralized theme system

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import { designTokens } from './designTokens';

// Example 1: Using design tokens directly
export const DesignTokensExample: React.FC = () => (
  <Box
    sx={{
      backgroundColor: designTokens.colors.primary[500],
      padding: designTokens.spacing.lg,
      borderRadius: designTokens.borderRadius.md,
      boxShadow: designTokens.shadows.md,
      margin: designTokens.spacing.md,
    }}
  >
    <Typography
      sx={{
        fontSize: designTokens.typography.fontSize.xl,
        fontWeight: designTokens.typography.fontWeight.semibold,
        color: designTokens.colors.text.inverse,
        marginBottom: designTokens.spacing.sm,
      }}
    >
      Design Tokens Example
    </Typography>
    <Typography
      sx={{
        fontSize: designTokens.typography.fontSize.md,
        color: designTokens.colors.text.inverse,
        opacity: 0.9,
      }}
    >
      This component uses design tokens directly for consistent styling.
    </Typography>
  </Box>
);

// Example 2: Using Material-UI theme
export const ThemeExample: React.FC = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        margin: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>
          Theme Example
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This component uses Material-UI theme for responsive and dynamic
          styling.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" sx={{ mr: 1 }}>
            Primary Button
          </Button>
          <Button variant="outlined">Secondary Button</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Example 3: Mixed approach (design tokens + theme)
export const MixedExample: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: designTokens.spacing.xl,
        backgroundColor: theme.palette.background.default,
        borderRadius: designTokens.borderRadius.lg,
        boxShadow: designTokens.shadows.lg,
        margin: designTokens.spacing.md,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: designTokens.colors.primary[600],
          marginBottom: designTokens.spacing.md,
          fontWeight: designTokens.typography.fontWeight.bold,
        }}
      >
        Mixed Approach
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          marginBottom: designTokens.spacing.lg,
          lineHeight: designTokens.typography.lineHeight.relaxed,
        }}
      >
        This example combines design tokens for specific values and theme for
        dynamic properties.
      </Typography>

      <Box
        sx={{ display: 'flex', gap: designTokens.spacing.md, flexWrap: 'wrap' }}
      >
        <Chip
          label="Success"
          color="success"
          sx={{ borderRadius: designTokens.borderRadius.xl }}
        />
        <Chip
          label="Warning"
          color="warning"
          sx={{ borderRadius: designTokens.borderRadius.xl }}
        />
        <Chip
          label="Error"
          color="error"
          sx={{ borderRadius: designTokens.borderRadius.xl }}
        />
      </Box>

      <Box sx={{ mt: designTokens.spacing.lg }}>
        <TextField
          label="Example Input"
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: designTokens.borderRadius.sm,
            },
          }}
        />
      </Box>
    </Box>
  );
};

// Example 4: Semantic color usage
export const SemanticColorsExample: React.FC = () => (
  <Box sx={{ padding: designTokens.spacing.md }}>
    <Typography variant="h5" gutterBottom>
      Semantic Colors
    </Typography>

    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: designTokens.spacing.sm,
      }}
    >
      <Alert
        severity="success"
        sx={{ borderRadius: designTokens.borderRadius.sm }}
      >
        Success message using semantic colors
      </Alert>

      <Alert
        severity="warning"
        sx={{ borderRadius: designTokens.borderRadius.sm }}
      >
        Warning message using semantic colors
      </Alert>

      <Alert
        severity="error"
        sx={{ borderRadius: designTokens.borderRadius.sm }}
      >
        Error message using semantic colors
      </Alert>

      <Alert
        severity="info"
        sx={{ borderRadius: designTokens.borderRadius.sm }}
      >
        Info message using semantic colors
      </Alert>
    </Box>
  </Box>
);

// Example 5: Responsive spacing
export const ResponsiveSpacingExample: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: {
          xs: designTokens.spacing.sm,
          sm: designTokens.spacing.md,
          md: designTokens.spacing.lg,
          lg: designTokens.spacing.xl,
        },
        backgroundColor: designTokens.colors.secondary[100],
        borderRadius: designTokens.borderRadius.md,
        margin: theme.spacing(2),
      }}
    >
      <Typography variant="h6" gutterBottom>
        Responsive Spacing
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This component uses responsive spacing that adapts to different screen
        sizes.
      </Typography>
    </Box>
  );
};

// Example 6: Custom component with theme integration
export const CustomStyledComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        padding: designTokens.spacing.lg,
        backgroundColor: designTokens.colors.background.paper,
        border: `2px solid ${designTokens.colors.primary[300]}`,
        borderRadius: designTokens.borderRadius.lg,
        boxShadow: designTokens.shadows.md,
        transition: designTokens.transitions.normal,
        cursor: 'pointer',

        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: designTokens.shadows.lg,
          borderColor: designTokens.colors.primary[500],
        },

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: designTokens.colors.primary[500],
          borderRadius: `${designTokens.borderRadius.lg} ${designTokens.borderRadius.lg} 0 0`,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: designTokens.colors.primary[700],
          fontWeight: designTokens.typography.fontWeight.semibold,
          marginBottom: designTokens.spacing.sm,
        }}
      >
        Custom Styled Component
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          lineHeight: designTokens.typography.lineHeight.relaxed,
        }}
      >
        This component demonstrates advanced styling with hover effects,
        pseudo-elements, and smooth transitions using design tokens.
      </Typography>
    </Box>
  );
};

// Export all examples
export const ThemeExamples = {
  DesignTokensExample,
  ThemeExample,
  MixedExample,
  SemanticColorsExample,
  ResponsiveSpacingExample,
  CustomStyledComponent,
};

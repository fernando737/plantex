import React from 'react';
import { Grid, Box, SxProps, Theme } from '@mui/material';
import { designTokens } from '@/config';

interface FormLayoutProps {
  children: React.ReactNode;
  spacing?: 'compact' | 'default' | 'comfortable';
  columns?: 1 | 2;
  sx?: SxProps<Theme>;
  className?: string;
  onSubmit?: (e?: React.FormEvent) => void;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  spacing = 'default',
  columns = 1,
  sx = {},
  className,
  onSubmit,
}) => {
  // Spacing configuration based on the spacing prop
  const spacingConfig = {
    compact: {
      fieldGap: designTokens.spacing.md, // 16px
      sectionGap: designTokens.spacing.lg, // 24px
    },
    default: {
      fieldGap: designTokens.formSpacing.fieldGap, // 24px
      sectionGap: designTokens.formSpacing.sectionGap, // 32px
    },
    comfortable: {
      fieldGap: designTokens.spacing.xl, // 32px
      sectionGap: designTokens.spacing.xxl, // 48px
    },
  };

  const currentSpacing = spacingConfig[spacing];

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        '& .MuiGrid-item': {
          marginBottom: currentSpacing.fieldGap,
          '&:last-child': {
            marginBottom: 0,
          },
        },
        '& .MuiGrid-container': {
          marginBottom: currentSpacing.sectionGap,
          '&:last-child': {
            marginBottom: 0,
          },
        },
        ...sx,
      }}
      className={className}
    >
      <Grid
        container
        spacing={currentSpacing.fieldGap}
        sx={{
          '& .MuiGrid-item': {
            // Override MUI's default margin to use our custom spacing
            margin: 0,
            paddingBottom: `${currentSpacing.fieldGap} !important`,
            '&:last-child': {
              paddingBottom: '0 !important',
            },
          },
        }}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return (
              <Grid
                item
                xs={12}
                md={columns === 2 ? 6 : 12}
                key={index}
                sx={{
                  // Ensure proper spacing between fields
                  '&:not(:last-child)': {
                    marginBottom: currentSpacing.fieldGap,
                  },
                }}
              >
                {child}
              </Grid>
            );
          }
          return child;
        })}
      </Grid>
    </Box>
  );
};

export default FormLayout;

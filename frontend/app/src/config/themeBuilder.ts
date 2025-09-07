// src/config/themeBuilder.ts
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { designTokens } from './designTokens';

const { colors, typography, shadows, borderRadius, spacing } = designTokens;

// Extend the Theme interface to include layout configuration
declare module '@mui/material/styles' {
  interface Theme {
    layout: {
      drawerWidth: string;
      drawerHeight: string;
      submenuWidth: string;
      spacing: {
        gutter: string;
      };
      padding: {
        sm: string;
        md: string;
        lg: string;
      };
    };
  }

  interface ThemeOptions {
    layout?: {
      drawerWidth?: string;
      drawerHeight?: string;
      submenuWidth?: string;
      spacing?: {
        gutter?: string;
      };
      padding?: {
        sm?: string;
        md?: string;
        lg?: string;
      };
    };
  }
}

// Base theme configuration using design tokens
const baseTheme: ThemeOptions = {
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[600],
      contrastText: colors.text.inverse,
    },
    secondary: {
      main: colors.secondary[100],
      light: colors.secondary[50],
      dark: colors.secondary[200],
      contrastText: colors.text.primary,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
      contrastText: colors.error.contrastText,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
      contrastText: colors.warning.contrastText,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
      contrastText: colors.info.contrastText,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
      contrastText: colors.success.contrastText,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    divider: colors.border.light,
  },

  // Add layout configuration to fix drawer width consistency
  layout: {
    drawerWidth: '260px',
    drawerHeight: '64px',
    submenuWidth: '300px',
    spacing: {
      gutter: '16px',
    },
    padding: {
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
  },

  typography: {
    fontFamily: typography.fontFamily.primary,
    h1: {
      fontSize: typography.fontSize.display,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h2: {
      fontSize: typography.fontSize.xxxl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
      color: colors.text.primary,
    },
    h3: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    h4: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    h5: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    h6: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
    },
    body1: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.relaxed,
      color: colors.text.primary,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.secondary,
    },
    button: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      textTransform: 'none',
      lineHeight: typography.lineHeight.normal,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.secondary,
    },
    overline: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: colors.text.secondary,
    },
  },

  shape: {
    borderRadius: parseInt(borderRadius.sm),
  },

  spacing: (factor: number) => `${factor * 8}px`,

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          boxShadow: shadows.sm,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          padding: `${spacing.sm} ${spacing.md}`,
          textTransform: 'none',
          fontWeight: typography.fontWeight.semibold,
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          backgroundColor: colors.primary[500],
          '&:hover': {
            backgroundColor: colors.primary[600],
            transform: 'translateY(-1px)',
            boxShadow: shadows.md,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary[500],
          color: colors.primary[500],
          '&:hover': {
            borderColor: colors.primary[600],
            color: colors.primary[600],
            backgroundColor: colors.primary[50],
          },
        },
        textPrimary: {
          color: colors.primary[500],
          '&:hover': {
            backgroundColor: colors.primary[50],
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          boxShadow: shadows.sm,
          padding: spacing.md,
          border: `1px solid ${colors.border.light}`,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.sm,
            '& fieldset': {
              borderColor: colors.border.medium,
            },
            '&:hover fieldset': {
              borderColor: colors.primary[500],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[500],
            },
          },
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          wordBreak: 'break-word',
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border.light}`,
          padding: `${spacing.sm} ${spacing.md}`,
        },
        head: {
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.secondary,
          backgroundColor: colors.secondary[100],
        },
      },
    },

    MuiSnackbar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
        },
        standardSuccess: {
          backgroundColor: colors.success.main,
          color: colors.success.contrastText,
        },
        standardError: {
          backgroundColor: colors.error.main,
          color: colors.error.contrastText,
        },
        standardWarning: {
          backgroundColor: colors.warning.main,
          color: colors.warning.contrastText,
        },
        standardInfo: {
          backgroundColor: colors.info.main,
          color: colors.info.contrastText,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.md,
          boxShadow: shadows.lg,
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          marginBottom: spacing.sm,
          '&:before': {
            display: 'none',
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          '&:hover': {
            backgroundColor: colors.secondary[100],
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xl,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary[500],
          color: colors.primary.contrastText,
          '&:hover': {
            backgroundColor: colors.primary[600],
            transform: 'scale(1.05)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          borderRight: `1px solid ${colors.border.light}`,
        },
      },
    },
  },
};

// Create and export the theme
export const theme: Theme = createTheme(baseTheme);

// Export theme builder function for dynamic theme creation
export const createAppTheme = (
  customOptions?: Partial<ThemeOptions>
): Theme => {
  return createTheme({
    ...baseTheme,
    ...customOptions,
  });
};

// Export design tokens for use in components
export { designTokens };

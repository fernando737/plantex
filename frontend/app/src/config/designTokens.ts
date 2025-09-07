// src/config/designTokens.ts
// Centralized design tokens for consistent theming

export const colors = {
  // Primary brand colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#007AFF', // Main primary color
    600: '#005BB5',
    700: '#004085',
    800: '#002855',
    900: '#001025',
    contrastText: '#FFFFFF',
  },

  // Secondary colors (darker palette for better contrast)
  secondary: {
    50: '#F5F5F5',
    100: '#EEEEEE',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#757575',
    500: '#424242',
    600: '#212121',
    700: '#1C1C1E',
    800: '#121212',
    900: '#000000',
  },

  // Semantic colors
  success: {
    light: '#4CAF50',
    main: '#34C759',
    dark: '#2E7D32',
    contrastText: '#FFFFFF',
  },

  warning: {
    light: '#FF9800',
    main: '#FF9500',
    dark: '#F57C00',
    contrastText: '#FFFFFF',
  },

  error: {
    light: '#F44336',
    main: '#FF3B30',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },

  info: {
    light: '#03A9F4',
    main: '#5AC8FA',
    dark: '#0288D1',
    contrastText: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    disabled: '#C7C7CC',
    inverse: '#FFFFFF',
  },

  // Background colors
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    dark: '#1C1C1E',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border colors
  border: {
    light: '#E5E5EA',
    medium: '#D1D1D6',
    dark: '#8E8E93',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const;

export const borderRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  round: '50%',
} as const;

export const typography = {
  fontFamily: {
    primary: "'SF Pro Text', 'Roboto', 'Arial', sans-serif",
    mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.8125rem', // 13px
    md: '0.875rem', // 14px
    lg: '0.9375rem', // 15px
    xl: '1rem', // 16px
    xxl: '1.25rem', // 20px
    xxxl: '1.5rem', // 24px
    display: '2rem', // 32px
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 4px rgba(0, 0, 0, 0.1)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.2)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

// Z-index scale
export const zIndex = {
  drawer: 1200,
  appBar: 1100,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

// Form-specific spacing configuration
export const formSpacing = {
  fieldGap: spacing.md, // 16px between form fields (reduced from 24px)
  sectionGap: spacing.lg, // 24px between form sections (reduced from 32px)
  containerPadding: spacing.lg, // 24px container padding
  buttonGap: spacing.md, // 16px between buttons
  labelMargin: spacing.sm, // 8px margin for labels
} as const;

// Export all tokens as a single object for easy access
export const designTokens = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  formSpacing,
} as const;

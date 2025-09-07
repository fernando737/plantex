// src/config/ThemeProvider.tsx
import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {
  theme as defaultTheme,
  createAppTheme,
  designTokens,
} from './themeBuilder';

// Theme context types
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme context
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(initialTheme);

  // Create theme based on mode
  const theme = useMemo(() => {
    if (themeMode === 'dark') {
      return createAppTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: designTokens.colors.primary[400], // Lighter for dark mode
            light: designTokens.colors.primary[300],
            dark: designTokens.colors.primary[600],
            contrastText: designTokens.colors.text.inverse,
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
            disabled: '#666666',
          },
          divider: '#333333',
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: '#1e1e1e',
                color: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: '#1e1e1e',
                border: `1px solid ${designTokens.colors.border.dark}`,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                backgroundColor: '#2a2a2a',
                color: '#B0B0B0',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: '#1e1e1e',
                borderRight: `1px solid ${designTokens.colors.border.dark}`,
              },
            },
          },
        },
      });
    }

    return defaultTheme;
  }, [themeMode]);

  // Theme context value
  const contextValue = useMemo(
    () => ({
      theme: themeMode,
      toggleTheme: () =>
        setThemeMode(prev => (prev === 'light' ? 'dark' : 'light')),
      setTheme: setThemeMode,
    }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Export theme provider as default
export default ThemeProvider;

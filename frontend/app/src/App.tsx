// Mock API removed - all requests now go directly to backend
import { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Box,
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import theme from './config/theme';
import AppRoutes from './routes/AppRoutes';
import { setAuthUser } from './utils/auth';
import { fetchCSRFToken } from './utils/csrf';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Error Fallback Component
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 3,
      }}
    >
      <h2>Something went wrong:</h2>
      <pre style={{ color: 'red', marginBottom: '1rem' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </Box>
  );
};

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const initializeAuthAndCSRF = async () => {
      try {
        await fetchCSRFToken();
        await setAuthUser();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsAppLoading(false);
      }
    };
    initializeAuthAndCSRF();
  }, []);

  if (isAppLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

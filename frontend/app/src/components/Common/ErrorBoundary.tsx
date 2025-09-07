import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { designTokens } from '@/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Implement error logging service
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (error) {
      // TODO: Implement error reporting service
      console.log('Reporting error:', { error, errorInfo });
      alert('Error reported. Thank you for your feedback.');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={designTokens.spacing.lg}
          textAlign="center"
          sx={{
            backgroundColor: designTokens.colors.background.default,
            borderRadius: designTokens.borderRadius.md,
            border: `1px solid ${designTokens.colors.border.light}`,
          }}
        >
          <Alert
            severity="error"
            sx={{
              mb: designTokens.spacing.lg,
              maxWidth: 600,
              borderRadius: designTokens.borderRadius.md,
            }}
            icon={<BugReportIcon />}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.error.main,
              }}
            >
              Something went wrong
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: designTokens.spacing.md,
                lineHeight: 1.5,
              }}
            >
              {this.state.error?.message ||
                'An unexpected error occurred. Please try again or contact support if the problem persists.'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: designTokens.spacing.sm,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleRetry}
                size="small"
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: designTokens.borderRadius.sm,
                  fontWeight: designTokens.typography.fontWeight.semibold,
                }}
              >
                Try Again
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleReportError}
                size="small"
                startIcon={<BugReportIcon />}
                sx={{
                  borderRadius: designTokens.borderRadius.sm,
                  borderColor: designTokens.colors.border.medium,
                }}
              >
                Report Issue
              </Button>
            </Box>

            {this.props.showDetails && this.state.errorInfo && (
              <Box
                sx={{
                  mt: designTokens.spacing.md,
                  p: designTokens.spacing.sm,
                  backgroundColor: designTokens.colors.background.dark,
                  borderRadius: designTokens.borderRadius.sm,
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  <strong>Component Stack:</strong>
                </Typography>
                <pre
                  style={{
                    fontSize: '12px',
                    margin: '8px 0 0 0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              </Box>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

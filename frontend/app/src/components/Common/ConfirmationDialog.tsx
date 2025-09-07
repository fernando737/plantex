import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import { designTokens } from '@/config';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info' | 'success';
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
  maxWidth = 'sm',
}) => {
  const theme = useTheme();

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return designTokens.colors.error.main;
      case 'warning':
        return designTokens.colors.warning.main;
      case 'success':
        return designTokens.colors.success.main;
      case 'info':
        return designTokens.colors.info.main;
      default:
        return designTokens.colors.primary[500];
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: designTokens.borderRadius.md,
          boxShadow: designTokens.shadows.lg,
          border: `1px solid ${designTokens.colors.border.light}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${designTokens.colors.border.light}`,
          backgroundColor: designTokens.colors.background.paper,
          color: getSeverityColor(),
          fontWeight: designTokens.typography.fontWeight.semibold,
          fontSize: designTokens.typography.fontSize.xl,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          padding: designTokens.spacing.lg,
          backgroundColor: designTokens.colors.background.default,
        }}
      >
        <DialogContentText
          sx={{
            color: theme.palette.text.secondary,
            fontSize: designTokens.typography.fontSize.md,
            lineHeight: designTokens.typography.lineHeight.normal,
            margin: 0,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          padding: designTokens.spacing.md,
          borderTop: `1px solid ${designTokens.colors.border.light}`,
          backgroundColor: designTokens.colors.background.paper,
          gap: designTokens.spacing.sm,
        }}
      >
        <Button
          onClick={onCancel}
          color="inherit"
          disabled={loading}
          sx={{
            borderRadius: designTokens.borderRadius.sm,
            borderColor: designTokens.colors.border.medium,
            fontWeight: designTokens.typography.fontWeight.medium,
            minWidth: 80,
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={getConfirmButtonColor()}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: designTokens.borderRadius.sm,
            fontWeight: designTokens.typography.fontWeight.semibold,
            minWidth: 80,
            backgroundColor: getSeverityColor(),
            '&:hover': {
              backgroundColor: getSeverityColor(),
              opacity: 0.9,
            },
          }}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;

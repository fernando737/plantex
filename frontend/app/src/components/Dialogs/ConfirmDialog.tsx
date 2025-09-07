// src/components/Dialogs/ConfirmDialog.tsx
import React from 'react';
import {
  Button,
  Typography,
} from '@mui/material';
import GenericDialog from './GenericDialog';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const actions = (
    <>
      <Button onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button
        onClick={handleConfirm}
        variant="contained"
        color={confirmColor}
        disabled={loading}
        sx={{ ml: 1 }}
      >
        {loading ? 'Processing...' : confirmText}
      </Button>
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xs"
      actions={actions}
      showCloseButton={!loading}
    >
      <Typography>
        {message}
      </Typography>
    </GenericDialog>
  );
};

export default ConfirmDialog;
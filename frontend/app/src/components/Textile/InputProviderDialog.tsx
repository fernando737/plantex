import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { InputProvider, InputProviderFormData, Input } from '@/types/textile';
import InputProviderForm from './InputProviderForm';
import { designTokens } from '@/config';

interface InputProviderDialogProps {
  open: boolean;
  inputProvider?: InputProvider;
  input?: Input;
  onClose: () => void;
  onSubmit: (data: InputProviderFormData) => void;
  loading?: boolean;
}

const InputProviderDialog: React.FC<InputProviderDialogProps> = ({
  open,
  inputProvider,
  input,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!inputProvider;

  const handleSubmit = (data: InputProviderFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.xl,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${designTokens.colors.border.light}`,
          fontSize: designTokens.typography.fontSize.xl,
          fontWeight: designTokens.typography.fontWeight.semibold,
          color: designTokens.colors.text.primary,
        }}
      >
        {isEdit ? 'Editar Precio de Proveedor' : 'Nuevo Precio de Proveedor'}
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            color: designTokens.colors.text.secondary,
            '&:hover': {
              backgroundColor: designTokens.colors.error.light + '20',
              color: designTokens.colors.error.main,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        sx={{
          p: designTokens.spacing.lg,
          backgroundColor: designTokens.colors.background.default,
        }}
      >
        <InputProviderForm
          initialData={inputProvider}
          input={input}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InputProviderDialog;
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Input, InputFormData } from '@/types/textile';
import InputForm from './InputForm';
import { designTokens } from '@/config';

interface InputDialogProps {
  open: boolean;
  input?: Input;
  onClose: () => void;
  onSubmit: (data: InputFormData) => void;
  loading?: boolean;
}

const InputDialog: React.FC<InputDialogProps> = ({
  open,
  input,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!input;

  const handleSubmit = (data: InputFormData) => {
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
        {isEdit ? 'Editar Insumo' : 'Nuevo Insumo'}
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
        <InputForm
          initialData={input}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InputDialog;
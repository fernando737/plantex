import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Provider, ProviderFormData } from '@/types/textile';
import ProviderForm from './ProviderForm';
import { designTokens } from '@/config';

interface ProviderDialogProps {
  open: boolean;
  provider?: Provider;
  onClose: () => void;
  onSubmit: (data: ProviderFormData) => void;
  loading?: boolean;
}

const ProviderDialog: React.FC<ProviderDialogProps> = ({
  open,
  provider,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!provider;

  const handleSubmit = (data: ProviderFormData) => {
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
        {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
        <ProviderForm
          initialData={provider}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProviderDialog;
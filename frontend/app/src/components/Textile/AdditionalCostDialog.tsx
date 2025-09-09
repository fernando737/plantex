import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AdditionalCost, AdditionalCostFormData, EndProduct } from '@/types/textile';
import AdditionalCostForm from './AdditionalCostForm';
import { designTokens } from '@/config';

interface AdditionalCostDialogProps {
  open: boolean;
  additionalCost?: AdditionalCost;
  endProduct?: EndProduct;
  onClose: () => void;
  onSubmit: (data: AdditionalCostFormData) => void;
  loading?: boolean;
}

const AdditionalCostDialog: React.FC<AdditionalCostDialogProps> = ({
  open,
  additionalCost,
  endProduct,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!additionalCost;

  const handleSubmit = (data: AdditionalCostFormData) => {
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
        {isEdit ? 'Editar Costo Adicional' : 'Nuevo Costo Adicional'}
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
        <AdditionalCostForm
          initialData={additionalCost}
          endProduct={endProduct}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdditionalCostDialog;
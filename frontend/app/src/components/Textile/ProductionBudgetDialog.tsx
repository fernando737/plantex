import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ProductionBudget, ProductionBudgetFormData } from '@/types/textile';
import ProductionBudgetForm from './ProductionBudgetForm';
import { designTokens } from '@/config';

interface ProductionBudgetDialogProps {
  open: boolean;
  productionBudget?: ProductionBudget;
  onClose: () => void;
  onSubmit: (data: ProductionBudgetFormData) => void;
  loading?: boolean;
}

const ProductionBudgetDialog: React.FC<ProductionBudgetDialogProps> = ({
  open,
  productionBudget,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!productionBudget;

  const handleSubmit = (data: ProductionBudgetFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
        {isEdit ? 'Editar Presupuesto de Producción' : 'Nuevo Presupuesto de Producción'}
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
        <ProductionBudgetForm
          initialData={productionBudget}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductionBudgetDialog;
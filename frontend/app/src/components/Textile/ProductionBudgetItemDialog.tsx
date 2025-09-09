import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ProductionBudgetItem, ProductionBudgetItemFormData, ProductionBudget } from '@/types/textile';
import ProductionBudgetItemForm from './ProductionBudgetItemForm';
import { designTokens } from '@/config';

interface ProductionBudgetItemDialogProps {
  open: boolean;
  productionBudgetItem?: ProductionBudgetItem;
  productionBudget?: ProductionBudget;
  onClose: () => void;
  onSubmit: (data: ProductionBudgetItemFormData) => void;
  loading?: boolean;
}

const ProductionBudgetItemDialog: React.FC<ProductionBudgetItemDialogProps> = ({
  open,
  productionBudgetItem,
  productionBudget,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!productionBudgetItem;

  const handleSubmit = (data: ProductionBudgetItemFormData) => {
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
        {isEdit ? 'Editar Item del Presupuesto' : 'Nuevo Item del Presupuesto'}
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
        <ProductionBudgetItemForm
          initialData={productionBudgetItem}
          productionBudget={productionBudget}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductionBudgetItemDialog;
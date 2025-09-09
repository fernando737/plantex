import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { BOMItem, BOMItemFormData, BOMTemplate } from '@/types/textile';
import BOMItemForm from './BOMItemForm';
import { designTokens } from '@/config';

interface BOMItemDialogProps {
  open: boolean;
  bomItem?: BOMItem;
  bomTemplate?: BOMTemplate;
  onClose: () => void;
  onSubmit: (data: BOMItemFormData) => void;
  loading?: boolean;
}

const BOMItemDialog: React.FC<BOMItemDialogProps> = ({
  open,
  bomItem,
  bomTemplate,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!bomItem;

  const handleSubmit = (data: BOMItemFormData) => {
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
        {isEdit ? 'Editar Item de BOM' : 'Nuevo Item de BOM'}
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
        <BOMItemForm
          initialData={bomItem}
          bomTemplate={bomTemplate}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BOMItemDialog;
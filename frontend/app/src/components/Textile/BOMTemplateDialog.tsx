import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { BOMTemplate, BOMTemplateFormData } from '@/types/textile';
import BOMTemplateForm from './BOMTemplateForm';
import { designTokens } from '@/config';

interface BOMTemplateDialogProps {
  open: boolean;
  bomTemplate?: BOMTemplate;
  onClose: () => void;
  onSubmit: (data: BOMTemplateFormData) => void;
  loading?: boolean;
}

const BOMTemplateDialog: React.FC<BOMTemplateDialogProps> = ({
  open,
  bomTemplate,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!bomTemplate;

  const handleSubmit = (data: BOMTemplateFormData) => {
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
        {isEdit ? 'Editar BOM' : 'Nueva BOM'}
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
        <BOMTemplateForm
          initialData={bomTemplate}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BOMTemplateDialog;
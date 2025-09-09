import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { Input, InputProvider, Provider } from '@/types/textile';
import { useInputProviders, useProviders } from '@/hooks/textile/useTextileApi';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface InputPricingDialogProps {
  open: boolean;
  input?: Input;
  onClose: () => void;
  onAddPrice?: (input: Input) => void;
  onEditPrice?: (inputProvider: InputProvider) => void;
}

const InputPricingDialog: React.FC<InputPricingDialogProps> = ({
  open,
  input,
  onClose,
  onAddPrice,
  onEditPrice,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<InputProvider | null>(null);

  const inputProviderHooks = useInputProviders();
  const providerHooks = useProviders();
  
  const { data: inputProvidersResponse, isLoading } = inputProviderHooks.useList(
    input ? { input: input.id } : undefined
  );
  const { data: providersResponse } = providerHooks.useList();
  const deleteInputProvider = inputProviderHooks.useDelete(priceToDelete?.id || 0);

  const inputProviders = inputProvidersResponse?.results || [];
  const providers = providersResponse?.results || [];

  // Create provider lookup map
  const providerMap = providers.reduce((acc, provider) => {
    acc[provider.id] = provider;
    return acc;
  }, {} as Record<number, Provider>);

  const handleDeleteClick = (inputProvider: InputProvider) => {
    setPriceToDelete(inputProvider);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!priceToDelete) return;

    try {
      await deleteInputProvider.mutateAsync();
      toast.success('Precio eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setPriceToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el precio');
      console.error('Delete input provider error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPriceToDelete(null);
  };

  const columns = [
    {
      id: 'provider',
      label: 'Proveedor',
      render: (inputProvider: InputProvider) => {
        const provider = providerMap[inputProvider.provider];
        return provider ? provider.name : 'Proveedor no encontrado';
      },
    },
    {
      id: 'is_preferred',
      label: 'Preferido',
      align: 'center' as const,
      render: (inputProvider: InputProvider) => (
        <Tooltip title={inputProvider.is_preferred ? 'Proveedor preferido' : 'No es el proveedor preferido'}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {inputProvider.is_preferred ? (
              <StarIcon 
                sx={{ 
                  color: designTokens.colors.warning.main,
                  fontSize: '1.2rem'
                }} 
              />
            ) : (
              <StarBorderIcon 
                sx={{ 
                  color: designTokens.colors.text.disabled,
                  fontSize: '1.2rem'
                }} 
              />
            )}
          </Box>
        </Tooltip>
      ),
    },
    {
      id: 'price_per_unit_cop',
      label: 'Precio por Unidad',
      render: (inputProvider: InputProvider) => formatCOP(inputProvider.price_per_unit_cop),
    },
    {
      id: 'updated_at',
      label: 'Última Actualización',
      render: (inputProvider: InputProvider) => 
        new Date(inputProvider.updated_at).toLocaleDateString('es-CO'),
    },
    {
      id: 'notes',
      label: 'Notas',
      render: (inputProvider: InputProvider) => {
        const notes = inputProvider.notes || '—';
        return notes.length > 30 ? `${notes.substring(0, 27)}...` : notes;
      },
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (inputProvider: InputProvider) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar precio">
            <IconButton
              size="small"
              onClick={() => onEditPrice?.(inputProvider)}
              sx={{
                color: designTokens.colors.primary[600],
                '&:hover': { backgroundColor: designTokens.colors.primary[50] },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar precio">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(inputProvider)}
              sx={{
                color: designTokens.colors.error.main,
                '&:hover': { backgroundColor: designTokens.colors.error.light + '20' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <>
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
          <Box>
            <Typography variant="h6" component="span">
              Precios por Proveedor
            </Typography>
            {input && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {input.name}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Configure los precios de este insumo para diferentes proveedores
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => input && onAddPrice?.(input)}
              sx={{
                borderRadius: designTokens.borderRadius.md,
              }}
            >
              Agregar Precio
            </Button>
          </Box>

          <Paper
            sx={{
              borderRadius: designTokens.borderRadius.lg,
              overflow: 'hidden',
            }}
          >
            <DataTableSimple
              data={inputProviders}
              columns={columns}
              loading={isLoading}
              emptyMessage="No hay precios configurados para este insumo"
            />
          </Paper>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Eliminar Precio"
        message={`¿Está seguro que desea eliminar este precio? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
        loading={deleteInputProvider.isPending}
      />
    </>
  );
};

export default InputPricingDialog;
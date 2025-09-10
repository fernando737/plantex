import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useEndProducts, useBOMTemplates } from '@/hooks/textile/useTextileApi';
import { EndProduct, BOMTemplate } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface EndProductsViewProps {
  onCreateEndProduct?: () => void;
  onEditEndProduct?: (endProduct: EndProduct) => void;
}

const EndProductsView: React.FC<EndProductsViewProps> = ({
  onCreateEndProduct,
  onEditEndProduct,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [endProductToDelete, setEndProductToDelete] = useState<EndProduct | null>(null);
  
  const endProductHooks = useEndProducts();
  const bomTemplateHooks = useBOMTemplates();
  
  const { data: endProductsResponse, isLoading } = endProductHooks.useList();
  const { data: bomTemplatesResponse } = bomTemplateHooks.useList();
  const deleteEndProduct = endProductHooks.useDelete(endProductToDelete?.id || 0);

  const endProducts = endProductsResponse?.results || [];
  const bomTemplates = bomTemplatesResponse?.results || [];

  // Create BOM lookup map
  const bomTemplateMap = bomTemplates.reduce((acc, bomTemplate) => {
    acc[bomTemplate.id] = bomTemplate;
    return acc;
  }, {} as Record<number, BOMTemplate>);

  const handleDeleteClick = (endProduct: EndProduct) => {
    setEndProductToDelete(endProduct);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!endProductToDelete) return;

    try {
      await deleteEndProduct.mutateAsync();
      toast.success('Producto final eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setEndProductToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el producto final');
      console.error('Delete end product error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setEndProductToDelete(null);
  };


  const getBOMTemplateName = (bomTemplateId?: number) => {
    if (!bomTemplateId) return '-';
    const template = bomTemplates.find(t => t.id === bomTemplateId);
    return template?.name || 'BOM no encontrada';
  };

  const columns = [
    {
      id: 'name',
      label: 'Producto Final',
      render: (endProduct: EndProduct) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {endProduct.name}
          </Typography>
          {endProduct.description && (
            <Typography variant="caption" color="text.secondary">
              {endProduct.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'bom_template',
      label: 'BOM Template',
      render: (endProduct: EndProduct) => (
        endProduct.bom_template ? (
          <Chip
            label={getBOMTemplateName(endProduct.bom_template)}
            size="small"
            sx={{
              backgroundColor: designTokens.colors.secondary.light + '20',
              color: designTokens.colors.secondary.main,
              fontWeight: 'medium',
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sin BOM
          </Typography>
        )
      ),
    },
    {
      id: 'bom_cost',
      label: 'Costo BOM',
      render: (endProduct: EndProduct) => formatCOP(endProduct.bom_cost_cop),
    },
    {
      id: 'total_cost',
      label: 'Costo Total',
      render: (endProduct: EndProduct) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCOP(endProduct.total_cost_cop)}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      render: (endProduct: EndProduct) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar producto">
            <IconButton
              onClick={() => onEditEndProduct?.(endProduct)}
              size="small"
              sx={{ color: designTokens.colors.primary.main }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar producto">
            <IconButton
              onClick={() => handleDeleteClick(endProduct)}
              size="small"
              sx={{ color: designTokens.colors.error.main }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: designTokens.typography.fontWeight.bold }}>
            Productos Finales
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {onCreateEndProduct && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateEndProduct}
                sx={{ borderRadius: designTokens.borderRadius.sm }}
              >
                Nuevo Producto
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gestiona los productos finales y sus costos totales de producción
        </Typography>
      </Box>

      {/* Data Table */}
      <Paper elevation={1} sx={{ borderRadius: designTokens.borderRadius.md }}>
        <DataTableSimple
          data={endProducts}
          columns={columns}
          loading={isLoading}
          emptyMessage="No hay productos finales registrados"
        />
      </Paper>

      {/* Dialogs */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Eliminar Producto Final"
        message={`¿Estás seguro de que deseas eliminar el producto "${endProductToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteEndProduct.isPending}
        severity="error"
      />
    </Container>
  );
};

export default EndProductsView;
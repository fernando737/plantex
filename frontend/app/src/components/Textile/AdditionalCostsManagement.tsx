import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as AttachMoneyIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useAdditionalCosts, useEndProductCostRecalculation } from '@/hooks/textile/useTextileApi';
import { EndProduct, AdditionalCost } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface AdditionalCostsManagementProps {
  endProduct?: EndProduct;
  onAddCost?: (endProduct: EndProduct) => void;
  onEditCost?: (additionalCost: AdditionalCost) => void;
}

const AdditionalCostsManagement: React.FC<AdditionalCostsManagementProps> = ({
  endProduct,
  onAddCost,
  onEditCost,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [costToDelete, setCostToDelete] = useState<AdditionalCost | null>(null);

  const additionalCostHooks = useAdditionalCosts();
  const costRecalculation = useEndProductCostRecalculation(endProduct?.id);

  const { data: additionalCostsResponse, isLoading } = additionalCostHooks.useList(
    endProduct ? { end_product: endProduct.id } : undefined
  );
  const deleteAdditionalCost = additionalCostHooks.useDelete(costToDelete?.id || 0);

  const additionalCosts = additionalCostsResponse?.results || [];

  const handleDeleteClick = (additionalCost: AdditionalCost) => {
    setCostToDelete(additionalCost);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!costToDelete) return;

    try {
      await deleteAdditionalCost.mutateAsync();
      toast.success('Costo adicional eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setCostToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el costo adicional');
      console.error('Delete additional cost error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setCostToDelete(null);
  };

  const handleRecalculateCosts = async () => {
    if (!endProduct) return;

    try {
      const result = await costRecalculation.mutateAsync({});
      toast.success(`Costos recalculados. Total: ${formatCOP(result.total_cost)}`);
    } catch (error) {
      toast.error('Error al recalcular los costos');
      console.error('Cost recalculation error:', error);
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Concepto',
      render: (additionalCost: AdditionalCost) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoneyIcon sx={{ color: designTokens.colors.success.main, fontSize: '1.2rem' }} />
          <Typography variant="body2" fontWeight="medium">
            {additionalCost.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'cost',
      label: 'Costo',
      render: (additionalCost: AdditionalCost) => (
        <Typography variant="body2" fontWeight="medium" color="success.main">
          {formatCOP(additionalCost.cost)}
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Fecha',
      render: (additionalCost: AdditionalCost) => 
        new Date(additionalCost.created_at).toLocaleDateString('es-CO'),
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (additionalCost: AdditionalCost) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar costo">
            <IconButton
              size="small"
              onClick={() => onEditCost?.(additionalCost)}
              sx={{
                color: designTokens.colors.primary[600],
                '&:hover': { backgroundColor: designTokens.colors.primary[50] },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar costo">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(additionalCost)}
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

  // Calculate total additional costs
  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + parseFloat(cost.cost), 0);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
            }}
          >
            Costos Adicionales
          </Typography>
          {endProduct && (
            <Typography variant="body2" color="text.secondary">
              {endProduct.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={handleRecalculateCosts}
            disabled={!endProduct || costRecalculation.isPending}
            sx={{
              borderRadius: designTokens.borderRadius.md,
            }}
          >
            {costRecalculation.isPending ? 'Recalculando...' : 'Recalcular'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => endProduct && onAddCost?.(endProduct)}
            disabled={!endProduct}
            sx={{
              borderRadius: designTokens.borderRadius.md,
            }}
          >
            Agregar Costo
          </Button>
        </Box>
      </Box>

      {/* Costs Table */}
      <Paper
        sx={{
          borderRadius: designTokens.borderRadius.lg,
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <DataTableSimple
          data={additionalCosts}
          columns={columns}
          loading={isLoading}
          emptyMessage={
            endProduct 
              ? "No hay costos adicionales. Agregue costos como packaging, marketing, utilidades, etc."
              : "Seleccione un producto para ver sus costos adicionales"
          }
        />
      </Paper>

      {/* Total Additional Costs Summary */}
      {additionalCosts.length > 0 && (
        <Box
          sx={{
            p: 2,
            backgroundColor: designTokens.colors.warning.light + '20',
            borderRadius: designTokens.borderRadius.md,
            border: `1px solid ${designTokens.colors.warning.light}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            Total Costos Adicionales:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: designTokens.typography.fontWeight.bold,
              color: designTokens.colors.warning.dark,
            }}
          >
            {formatCOP(totalAdditionalCosts)}
          </Typography>
        </Box>
      )}

      {/* Product Cost Summary */}
      {endProduct && (
        <Box
          sx={{
            mt: 2,
            p: 3,
            backgroundColor: designTokens.colors.success.light + '15',
            borderRadius: designTokens.borderRadius.md,
            border: `1px solid ${designTokens.colors.success.light}`,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
            Resumen de Costos del Producto
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Costo Base: {formatCOP(endProduct.base_cost_cop)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Costos Adicionales: {formatCOP(totalAdditionalCosts)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Costo Total del Producto
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  color: designTokens.colors.success.main,
                }}
              >
                {formatCOP(endProduct.total_cost_cop)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Eliminar Costo Adicional"
        message={`¿Está seguro que desea eliminar el costo "${costToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
        loading={deleteAdditionalCost.isPending}
      />
    </Box>
  );
};

export default AdditionalCostsManagement;
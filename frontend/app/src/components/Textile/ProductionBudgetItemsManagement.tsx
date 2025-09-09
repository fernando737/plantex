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
  Inventory as InventoryIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useProductionBudgetItems, useEndProducts, useProductionBudgetCostRecalculation } from '@/hooks/textile/useTextileApi';
import { ProductionBudget, ProductionBudgetItem, EndProduct } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface ProductionBudgetItemsManagementProps {
  productionBudget?: ProductionBudget;
  onAddItem?: (productionBudget: ProductionBudget) => void;
  onEditItem?: (productionBudgetItem: ProductionBudgetItem) => void;
  onClose?: () => void;
}

const ProductionBudgetItemsManagement: React.FC<ProductionBudgetItemsManagementProps> = ({
  productionBudget,
  onAddItem,
  onEditItem,
  onClose,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductionBudgetItem | null>(null);

  const budgetItemHooks = useProductionBudgetItems();
  const endProductHooks = useEndProducts();
  const costRecalculation = useProductionBudgetCostRecalculation(productionBudget?.id);

  const { data: budgetItemsResponse, isLoading } = budgetItemHooks.useList(
    productionBudget ? { production_budget: productionBudget.id } : undefined
  );
  const { data: endProductsResponse } = endProductHooks.useList();
  const deleteBudgetItem = budgetItemHooks.useDelete(itemToDelete?.id || 0);

  const budgetItems = budgetItemsResponse?.results || [];
  const endProducts = endProductsResponse?.results || [];

  // Create lookup map for end products
  const endProductMap = endProducts.reduce((acc, endProduct) => {
    acc[endProduct.id] = endProduct;
    return acc;
  }, {} as Record<number, EndProduct>);

  const handleDeleteClick = (budgetItem: ProductionBudgetItem) => {
    setItemToDelete(budgetItem);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteBudgetItem.mutateAsync();
      toast.success('Item eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el item');
      console.error('Delete budget item error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleRecalculateCosts = async () => {
    if (!productionBudget) return;

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
      id: 'end_product',
      label: 'Producto Final',
      render: (budgetItem: ProductionBudgetItem) => {
        const endProduct = endProductMap[budgetItem.end_product];
        
        return endProduct ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon sx={{ color: designTokens.colors.primary[500], fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {endProduct.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Costo unitario: {formatCOP(endProduct.total_cost_cop)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Producto no encontrado
          </Typography>
        );
      },
    },
    {
      id: 'quantity',
      label: 'Cantidad',
      render: (budgetItem: ProductionBudgetItem) => (
        <Typography variant="body2" fontWeight="medium">
          {budgetItem.planned_quantity.toLocaleString('es-CO')} unidades
        </Typography>
      ),
    },
    {
      id: 'cost_per_unit',
      label: 'Costo Unitario',
      render: (budgetItem: ProductionBudgetItem) => formatCOP(budgetItem.unit_cost_cop),
    },
    {
      id: 'total_cost',
      label: 'Costo Total',
      render: (budgetItem: ProductionBudgetItem) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCOP(budgetItem.total_cost_cop)}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (budgetItem: ProductionBudgetItem) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar item">
            <IconButton
              size="small"
              onClick={() => onEditItem?.(budgetItem)}
              sx={{
                color: designTokens.colors.primary[600],
                '&:hover': { backgroundColor: designTokens.colors.primary[50] },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar item">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(budgetItem)}
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

  // Calculate totals
  const totalItems = budgetItems.length;
  const totalQuantity = budgetItems.reduce((sum, item) => sum + item.planned_quantity, 0);
  const totalCost = budgetItems.reduce((sum, item) => sum + parseFloat(item.total_cost_cop), 0);

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
            Items del Presupuesto
          </Typography>
          {productionBudget && (
            <Typography variant="body2" color="text.secondary">
              {productionBudget.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={handleRecalculateCosts}
            disabled={!productionBudget || costRecalculation.isPending}
            sx={{
              borderRadius: designTokens.borderRadius.md,
            }}
          >
            {costRecalculation.isPending ? 'Recalculando...' : 'Recalcular Costos'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => productionBudget && onAddItem?.(productionBudget)}
            disabled={!productionBudget}
            sx={{
              borderRadius: designTokens.borderRadius.md,
            }}
          >
            Agregar Producto
          </Button>
          {onClose && (
            <Button
              variant="text"
              onClick={onClose}
              sx={{
                borderRadius: designTokens.borderRadius.md,
                minWidth: 'auto',
              }}
            >
              Cerrar
            </Button>
          )}
        </Box>
      </Box>

      {/* Items Table */}
      <Paper
        sx={{
          borderRadius: designTokens.borderRadius.lg,
          overflow: 'hidden',
        }}
      >
        <DataTableSimple
          data={budgetItems}
          columns={columns}
          loading={isLoading}
          emptyMessage={
            productionBudget 
              ? "No hay productos en este presupuesto. Agregue productos finales con sus cantidades."
              : "Seleccione un presupuesto para ver sus items"
          }
        />
      </Paper>

      {/* Summary */}
      {budgetItems.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {/* Statistics */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: designTokens.colors.info.light + '15',
              borderRadius: designTokens.borderRadius.md,
              border: `1px solid ${designTokens.colors.info.light}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
              Resumen de Producción
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <Box>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {totalItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Productos Diferentes
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {totalQuantity.toLocaleString('es-CO')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unidades Totales
                </Typography>
              </Box>
              
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: designTokens.colors.success.main 
                  }}
                >
                  {formatCOP(totalCost)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Costo Total
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Cost per Unit Average */}
          {totalQuantity > 0 && (
            <Box
              sx={{
                p: 2,
                backgroundColor: designTokens.colors.success.light + '15',
                borderRadius: designTokens.borderRadius.md,
                border: `1px solid ${designTokens.colors.success.light}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1" fontWeight="medium">
                Costo Promedio por Unidad:
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  color: designTokens.colors.success.main,
                }}
              >
                {formatCOP(totalCost / totalQuantity)}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Eliminar Item del Presupuesto"
        message={`¿Está seguro que desea eliminar este item? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
        loading={deleteBudgetItem.isPending}
      />
    </Box>
  );
};

export default ProductionBudgetItemsManagement;
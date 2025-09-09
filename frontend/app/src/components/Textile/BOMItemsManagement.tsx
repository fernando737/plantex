import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useBOMItems, useInputs, useUnits, useBOMCostRecalculation } from '@/hooks/textile/useTextileApi';
import { BOMTemplate, BOMItem, Input, Unit } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface BOMItemsManagementProps {
  bomTemplate?: BOMTemplate;
  onAddItem?: (bomTemplate: BOMTemplate) => void;
  onEditItem?: (bomItem: BOMItem) => void;
}

const BOMItemsManagement: React.FC<BOMItemsManagementProps> = ({
  bomTemplate,
  onAddItem,
  onEditItem,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BOMItem | null>(null);

  const bomItemHooks = useBOMItems();
  const inputHooks = useInputs();
  const unitHooks = useUnits();
  const costRecalculation = useBOMCostRecalculation(bomTemplate?.id);

  const { data: bomItemsResponse, isLoading } = bomItemHooks.useList(
    bomTemplate ? { bom_template: bomTemplate.id } : undefined
  );
  const { data: inputsResponse } = inputHooks.useList();
  const { data: unitsResponse } = unitHooks.useList();
  const deleteBOMItem = bomItemHooks.useDelete(itemToDelete?.id || 0);

  const bomItems = bomItemsResponse?.results || [];
  const inputs = inputsResponse?.results || [];
  const units = unitsResponse?.results || [];

  // Create lookup maps for quick access
  const inputMap = inputs.reduce((acc, input) => {
    acc[input.id] = input;
    return acc;
  }, {} as Record<number, Input>);

  const unitMap = units.reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {} as Record<number, Unit>);

  const handleDeleteClick = (bomItem: BOMItem) => {
    setItemToDelete(bomItem);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteBOMItem.mutateAsync();
      toast.success('Item eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el item');
      console.error('Delete BOM item error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleRecalculateCosts = async () => {
    if (!bomTemplate) return;

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
      id: 'input',
      label: 'Insumo',
      render: (bomItem: BOMItem) => {
        const input = inputMap[bomItem.input];
        const unit = input ? unitMap[input.unit] : null;
        
        return input ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: designTokens.colors.primary[500], fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {input.name}
              </Typography>
              {unit && (
                <Chip
                  label={`${unit.name} (${unit.symbol})`}
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: designTokens.colors.secondary[100],
                    color: designTokens.colors.secondary[800],
                  }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Insumo no encontrado
          </Typography>
        );
      },
    },
    {
      id: 'quantity_needed',
      label: 'Cantidad',
      render: (bomItem: BOMItem) => {
        const input = inputMap[bomItem.input];
        const unit = input ? unitMap[input.unit] : null;
        return `${bomItem.quantity_needed} ${unit?.symbol || ''}`;
      },
    },
    {
      id: 'cost_per_unit',
      label: 'Costo Unitario',
      render: (bomItem: BOMItem) => formatCOP(bomItem.cost_per_unit),
    },
    {
      id: 'total_cost',
      label: 'Costo Total',
      render: (bomItem: BOMItem) => (
        <Typography variant="body2" fontWeight="medium">
          {formatCOP(bomItem.total_cost)}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (bomItem: BOMItem) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar item">
            <IconButton
              size="small"
              onClick={() => onEditItem?.(bomItem)}
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
              onClick={() => handleDeleteClick(bomItem)}
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

  // Calculate total cost
  const totalCost = bomItems.reduce((sum, item) => sum + parseFloat(item.total_cost), 0);

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
            Items de la BOM
          </Typography>
          {bomTemplate && (
            <Typography variant="body2" color="text.secondary">
              {bomTemplate.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CalculateIcon />}
            onClick={handleRecalculateCosts}
            disabled={!bomTemplate || costRecalculation.isPending}
            sx={{
              borderRadius: designTokens.borderRadius.md,
            }}
          >
            {costRecalculation.isPending ? 'Recalculando...' : 'Recalcular Costos'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => bomTemplate && onAddItem?.(bomTemplate)}
            disabled={!bomTemplate}
            sx={{
              borderRadius: designTokens.borderRadius.md,
            }}
          >
            Agregar Item
          </Button>
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
          data={bomItems}
          columns={columns}
          loading={isLoading}
          emptyMessage={
            bomTemplate 
              ? "No hay items en esta BOM. Agregue insumos para comenzar."
              : "Seleccione una BOM para ver sus items"
          }
        />
      </Paper>

      {/* Total Cost Summary */}
      {bomItems.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: designTokens.colors.success.light + '20',
            borderRadius: designTokens.borderRadius.md,
            border: `1px solid ${designTokens.colors.success.light}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            Costo Total de la BOM:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: designTokens.typography.fontWeight.bold,
              color: designTokens.colors.success.main,
            }}
          >
            {formatCOP(totalCost)}
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Eliminar Item de BOM"
        message={`¿Está seguro que desea eliminar este item? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
        loading={deleteBOMItem.isPending}
      />
    </Box>
  );
};

export default BOMItemsManagement;
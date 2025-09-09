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
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { BOMTemplate, BOMItem, Input, Unit } from '@/types/textile';
import { useBOMItems, useInputs, useUnits, useBOMCostRecalculation } from '@/hooks/textile/useTextileApi';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface BOMItemsDialogProps {
  open: boolean;
  bomTemplate?: BOMTemplate;
  onClose: () => void;
  onAddItem?: (bomTemplate: BOMTemplate) => void;
  onEditItem?: (bomItem: BOMItem) => void;
}

const BOMItemsDialog: React.FC<BOMItemsDialogProps> = ({
  open,
  bomTemplate,
  onClose,
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
                  label={`${unit.name_es} (${unit.abbreviation})`}
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
      id: 'quantity',
      label: 'Cantidad',
      render: (bomItem: BOMItem) => {
        const input = inputMap[bomItem.input];
        const unit = input ? unitMap[input.unit] : null;
        const formattedQuantity = parseFloat(bomItem.quantity).toString();
        return `${formattedQuantity} ${unit?.abbreviation || ''}`;
      },
    },
    {
      id: 'line_cost_cop',
      label: 'Costo Total',
      render: (bomItem: BOMItem) => (
        <Typography variant="body2" fontWeight="medium">
          {formatCOP(bomItem.line_cost_cop)}
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
  const totalCost = bomItems.reduce((sum, item) => sum + parseFloat(item.line_cost_cop), 0);

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
              Items de la BOM
            </Typography>
            {bomTemplate && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {bomTemplate.name}
                {bomTemplate.description && (
                  <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                    {bomTemplate.description}
                  </Typography>
                )}
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
          {/* Action Bar */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Configure los insumos y cantidades necesarios para esta BOM
            </Typography>
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
                  : "No hay BOM seleccionada"
              }
            />
          </Paper>

          {/* Total Cost Summary */}
          {bomItems.length > 0 && (
            <Box
              sx={{
                mt: 3,
                p: 3,
                backgroundColor: designTokens.colors.success.light + '20',
                borderRadius: designTokens.borderRadius.lg,
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
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default BOMItemsDialog;
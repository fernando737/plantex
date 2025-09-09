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
  Calculate as CalculateIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { useProductionBudgets, useProductionBudgetCostRecalculation } from '@/hooks/textile/useTextileApi';
import { ProductionBudget } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import ProductionBudgetItemsManagement from './ProductionBudgetItemsManagement';
import { ReportsModal } from './Reports';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface ProductionBudgetsViewProps {
  onCreateProductionBudget?: () => void;
  onEditProductionBudget?: (productionBudget: ProductionBudget) => void;
  onAddBudgetItem?: (productionBudget: ProductionBudget) => void;
  onEditBudgetItem?: (budgetItem: any) => void;
}

const ProductionBudgetsView: React.FC<ProductionBudgetsViewProps> = ({
  onCreateProductionBudget,
  onEditProductionBudget,
  onAddBudgetItem,
  onEditBudgetItem,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<ProductionBudget | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<ProductionBudget | null>(null);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [budgetForReports, setBudgetForReports] = useState<ProductionBudget | null>(null);
  
  const productionBudgetHooks = useProductionBudgets();
  const costRecalculation = useProductionBudgetCostRecalculation();
  
  const { data: productionBudgetsResponse, isLoading } = productionBudgetHooks.useList();
  const deleteProductionBudget = productionBudgetHooks.useDelete(budgetToDelete?.id || 0);

  const productionBudgets = productionBudgetsResponse?.results || [];

  const handleDeleteClick = (productionBudget: ProductionBudget) => {
    setBudgetToDelete(productionBudget);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;

    try {
      await deleteProductionBudget.mutateAsync();
      toast.success('Presupuesto de producción eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setBudgetToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el presupuesto de producción');
      console.error('Delete production budget error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setBudgetToDelete(null);
  };

  const handleReportsClick = (budget: ProductionBudget) => {
    setBudgetForReports(budget);
    setReportsModalOpen(true);
  };

  const handleReportsClose = () => {
    setReportsModalOpen(false);
    setBudgetForReports(null);
  };


  const handleRecalculateAllCosts = async () => {
    try {
      const result = await costRecalculation.mutateAsync({});
      toast.success(`Costos recalculados para todos los presupuestos: ${result.updated_count} actualizados`);
    } catch (error) {
      toast.error('Error al recalcular los costos');
      console.error('Cost recalculation error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'approved': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'approved': return 'Aprobado';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Presupuesto de Producción',
      render: (productionBudget: ProductionBudget) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {productionBudget.name}
          </Typography>
          {productionBudget.description && (
            <Typography variant="caption" color="text.secondary">
              {productionBudget.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Estado',
      render: (productionBudget: ProductionBudget) => (
        <Chip
          label={getStatusLabel(productionBudget.status)}
          size="small"
          color={getStatusColor(productionBudget.status) as any}
          sx={{ fontWeight: 'medium' }}
        />
      ),
    },
    {
      id: 'total_cost',
      label: 'Costo Total',
      render: (productionBudget: ProductionBudget) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCOP(productionBudget.total_budget_cop)}
        </Typography>
      ),
    },
    {
      id: 'created_at',
      label: 'Fecha de Creación',
      render: (productionBudget: ProductionBudget) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(productionBudget.created_at).toLocaleDateString('es-CO')}
        </Typography>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      render: (productionBudget: ProductionBudget) => (
        <Tooltip title="Gestionar productos del presupuesto">
          <IconButton
            onClick={() => setSelectedBudget(productionBudget)}
            size="small"
            sx={{ color: designTokens.colors.secondary[500] }}
          >
            <ShoppingCartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      render: (productionBudget: ProductionBudget) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar presupuesto">
            <IconButton
              onClick={() => onEditProductionBudget?.(productionBudget)}
              size="small"
              sx={{ color: designTokens.colors.primary[500] }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver reportes">
            <IconButton
              onClick={() => handleReportsClick(productionBudget)}
              size="small"
              sx={{ color: designTokens.colors.info.main }}
            >
              <ReportsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar presupuesto">
            <IconButton
              onClick={() => handleDeleteClick(productionBudget)}
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
            Presupuestos de Producción
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Recalcular todos los costos">
              <IconButton
                onClick={handleRecalculateAllCosts}
                disabled={costRecalculation.isPending}
                sx={{ 
                  color: designTokens.colors.info.main,
                  '&:hover': { backgroundColor: designTokens.colors.info.light + '20' }
                }}
              >
                <CalculateIcon />
              </IconButton>
            </Tooltip>
            {onCreateProductionBudget && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateProductionBudget}
                sx={{ borderRadius: designTokens.borderRadius.sm }}
              >
                Nuevo Presupuesto
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Planifica y gestiona los presupuestos de producción con costos detallados
        </Typography>
      </Box>

      {/* Data Table */}
      <Paper elevation={1} sx={{ borderRadius: designTokens.borderRadius.md }}>
        <DataTableSimple
          data={productionBudgets}
          columns={columns}
          loading={isLoading}
          emptyMessage="No hay presupuestos de producción registrados"
        />
      </Paper>

      {/* Budget Items Management */}
      {selectedBudget && (
        <Box sx={{ mt: 4 }}>
          <ProductionBudgetItemsManagement
            productionBudget={selectedBudget}
            onAddItem={onAddBudgetItem}
            onEditItem={onEditBudgetItem}
            onClose={() => setSelectedBudget(null)}
          />
        </Box>
      )}

      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Eliminar Presupuesto de Producción"
        message={`¿Estás seguro de que deseas eliminar el presupuesto "${budgetToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteProductionBudget.isPending}
        severity="error"
      />

      <ReportsModal
        open={reportsModalOpen}
        budget={budgetForReports}
        onClose={handleReportsClose}
      />
    </Container>
  );
};

export default ProductionBudgetsView;
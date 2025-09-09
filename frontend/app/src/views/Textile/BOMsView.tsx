import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ListAlt as ListAltIcon,
  Calculate as CalculateIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useBOMTemplates, useBOMItems, useBOMCostRecalculation } from '@/hooks/textile/useTextileApi';
import { BOMTemplate } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import BOMItemsDialog from '@/components/Textile/BOMItemsDialog';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface BOMsViewProps {
  onCreateBOM?: () => void;
  onEditBOM?: (bomTemplate: BOMTemplate) => void;
  onAddBOMItem?: (bomTemplate: BOMTemplate) => void;
  onEditBOMItem?: (bomItem: any) => void;
}

const BOMsView: React.FC<BOMsViewProps> = ({
  onCreateBOM,
  onEditBOM,
  onAddBOMItem,
  onEditBOMItem,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bomToDelete, setBOMToDelete] = useState<BOMTemplate | null>(null);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMTemplate | null>(null);
  
  const bomTemplateHooks = useBOMTemplates();
  const bomItemHooks = useBOMItems();
  const costRecalculation = useBOMCostRecalculation();
  
  const { data: bomTemplatesResponse, isLoading } = bomTemplateHooks.useList();
  const { data: allBomItemsResponse } = bomItemHooks.useList();
  const deleteBOMTemplate = bomTemplateHooks.useDelete(bomToDelete?.id || 0);

  const bomTemplates = bomTemplatesResponse?.results || [];
  const allBomItems = allBomItemsResponse?.results || [];

  // Function to calculate BOM total cost from its items
  const calculateBOMTotalCost = (bomTemplateId: number): number => {
    const bomItems = allBomItems.filter(item => item.bom_template === bomTemplateId);
    return bomItems.reduce((sum, item) => sum + parseFloat(item.line_cost_cop || '0'), 0);
  };

  const handleDeleteClick = (bomTemplate: BOMTemplate) => {
    setBOMToDelete(bomTemplate);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bomToDelete) return;

    try {
      await deleteBOMTemplate.mutateAsync();
      toast.success('BOM eliminada exitosamente');
      setDeleteConfirmOpen(false);
      setBOMToDelete(null);
      // Clear selection if deleted BOM was selected
      if (selectedBOM?.id === bomToDelete.id) {
        setSelectedBOM(null);
      }
    } catch (error) {
      toast.error('Error al eliminar la BOM');
      console.error('Delete BOM error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setBOMToDelete(null);
  };

  const handleRecalculateAllCosts = async () => {
    try {
      const result = await costRecalculation.mutateAsync({});
      toast.success(`Costos recalculados para todas las BOMs: ${result.updated_count} actualizadas`);
    } catch (error) {
      toast.error('Error al recalcular los costos');
      console.error('Cost recalculation error:', error);
    }
  };

  const handleViewBOM = (bomTemplate: BOMTemplate) => {
    setSelectedBOM(bomTemplate);
    setItemsDialogOpen(true);
  };

  const handleCloseItemsDialog = () => {
    setItemsDialogOpen(false);
    setSelectedBOM(null);
  };

  const columns = [
    {
      id: 'name',
      label: 'BOM',
      render: (bomTemplate: BOMTemplate) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ListAltIcon sx={{ color: designTokens.colors.primary[500], fontSize: '1.2rem' }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {bomTemplate.name}
            </Typography>
            {bomTemplate.description && (
              <Typography variant="caption" color="text.secondary">
                {bomTemplate.description.length > 80 
                  ? `${bomTemplate.description.substring(0, 77)}...` 
                  : bomTemplate.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'total_cost',
      label: 'Costo Total',
      render: (bomTemplate: BOMTemplate) => {
        const backendTotal = parseFloat(bomTemplate.total_cost_cop || '0');
        const calculatedTotal = backendTotal === 0 ? calculateBOMTotalCost(bomTemplate.id) : backendTotal;
        
        return (
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {formatCOP(calculatedTotal)}
          </Typography>
        );
      },
    },
    {
      id: 'created_at',
      label: 'Fecha de Creación',
      render: (bomTemplate: BOMTemplate) => 
        new Date(bomTemplate.created_at).toLocaleDateString('es-CO'),
    },
    {
      id: 'view',
      label: 'Ver Items',
      align: 'center' as const,
      render: (bomTemplate: BOMTemplate) => (
        <Tooltip title="Ver items de la BOM">
          <IconButton
            size="small"
            onClick={() => handleViewBOM(bomTemplate)}
            sx={{
              color: designTokens.colors.info.main,
              '&:hover': { 
                backgroundColor: designTokens.colors.info.light + '20' 
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (bomTemplate: BOMTemplate) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar BOM">
            <IconButton
              size="small"
              onClick={() => onEditBOM?.(bomTemplate)}
              sx={{
                color: designTokens.colors.primary[600],
                '&:hover': { backgroundColor: designTokens.colors.primary[50] },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar BOM">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(bomTemplate)}
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
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.text.primary,
                mb: 0.5,
              }}
            >
              BOMs (Lista de Materiales)
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: designTokens.colors.text.secondary }}
            >
              Gestiona las listas de materiales y sus costos de producción
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CalculateIcon />}
              onClick={handleRecalculateAllCosts}
              disabled={costRecalculation.isPending}
              sx={{
                borderRadius: designTokens.borderRadius.md,
              }}
            >
              {costRecalculation.isPending ? 'Recalculando...' : 'Recalcular Todos'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateBOM}
              sx={{
                borderRadius: designTokens.borderRadius.md,
                px: 3,
              }}
            >
              Nueva BOM
            </Button>
          </Box>
        </Box>

        {/* BOMs List */}
        <Paper
          sx={{
            borderRadius: designTokens.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <DataTableSimple
            data={bomTemplates}
            columns={columns}
            loading={isLoading}
            emptyMessage="No hay BOMs registradas"
          />
        </Paper>

        {/* BOM Items Dialog */}
        <BOMItemsDialog
          open={itemsDialogOpen}
          bomTemplate={selectedBOM || undefined}
          onClose={handleCloseItemsDialog}
          onAddItem={onAddBOMItem}
          onEditItem={onEditBOMItem}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmOpen}
          title="Eliminar BOM"
          message={`¿Está seguro que desea eliminar la BOM "${bomToDelete?.name}"? Esta acción eliminará también todos sus items y no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          severity="error"
          loading={deleteBOMTemplate.isPending}
        />
      </Box>
    </Container>
  );
};

export default BOMsView;
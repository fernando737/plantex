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
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useInputs, useUnits } from '@/hooks/textile/useTextileApi';
import { Input, InputWithUnit } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface InputsViewProps {
  onCreateInput?: () => void;
  onEditInput?: (input: Input) => void;
  onManagePricing?: (input: Input) => void;
}

const InputsView: React.FC<InputsViewProps> = ({
  onCreateInput,
  onEditInput,
  onManagePricing,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inputToDelete, setInputToDelete] = useState<Input | null>(null);

  const inputHooks = useInputs();
  const unitHooks = useUnits();
  
  const { data: inputsResponse, isLoading } = inputHooks.useList();
  const { data: unitsResponse } = unitHooks.useList();
  const deleteInput = inputHooks.useDelete(inputToDelete?.id || 0);

  const inputs = inputsResponse?.results || [];
  const units = unitsResponse?.results || [];

  // Create a map for quick unit lookup
  const unitMap = units.reduce((acc, unit) => {
    acc[unit.id] = unit;
    return acc;
  }, {} as Record<number, any>);

  const handleDeleteClick = (input: Input) => {
    setInputToDelete(input);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!inputToDelete) return;

    try {
      await deleteInput.mutateAsync();
      toast.success('Insumo eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setInputToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el insumo');
      console.error('Delete input error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setInputToDelete(null);
  };

  const columns = [
    {
      id: 'name',
      label: 'Insumo',
      render: (input: Input) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon sx={{ color: designTokens.colors.primary[500], fontSize: '1.2rem' }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {input.name}
            </Typography>
            {input.description && (
              <Typography variant="caption" color="text.secondary">
                {input.description.length > 60 
                  ? `${input.description.substring(0, 57)}...` 
                  : input.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: 'unit',
      label: 'Unidad',
      render: (input: Input) => {
        const unit = unitMap[input.unit];
        return unit ? (
          <Chip
            label={`${unit.name_es} (${unit.abbreviation})`}
            size="small"
            sx={{
              backgroundColor: designTokens.colors.secondary[100],
              color: designTokens.colors.secondary[800],
              fontWeight: 'medium',
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Unidad no encontrada
          </Typography>
        );
      },
    },
    {
      id: 'pricing',
      label: 'Precios',
      align: 'center' as const,
      render: (input: Input) => (
        <Tooltip title="Gestionar precios por proveedor">
          <IconButton
            size="small"
            onClick={() => onManagePricing?.(input)}
            sx={{
              color: designTokens.colors.success.main,
              '&:hover': { 
                backgroundColor: designTokens.colors.success.light + '20' 
              },
            }}
          >
            <AttachMoneyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (input: Input) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar insumo">
            <IconButton
              size="small"
              onClick={() => onEditInput?.(input)}
              sx={{
                color: designTokens.colors.primary[600],
                '&:hover': { backgroundColor: designTokens.colors.primary[50] },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar insumo">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(input)}
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
    <Container maxWidth="lg">
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
              Insumos
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: designTokens.colors.text.secondary }}
            >
              Gestiona los insumos y materiales para la producción
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateInput}
            sx={{
              borderRadius: designTokens.borderRadius.md,
              px: 3,
            }}
          >
            Nuevo Insumo
          </Button>
        </Box>

        {/* Inputs Table */}
        <Paper
          sx={{
            borderRadius: designTokens.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <DataTableSimple
            data={inputs}
            columns={columns}
            loading={isLoading}
            emptyMessage="No hay insumos registrados"
          />
        </Paper>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmOpen}
          title="Eliminar Insumo"
          message={`¿Está seguro que desea eliminar el insumo "${inputToDelete?.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          severity="error"
          loading={deleteInput.isPending}
        />
      </Box>
    </Container>
  );
};

export default InputsView;
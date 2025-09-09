import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { ProductionBudget } from '@/types/textile';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';

interface ProductionBudgetsDialogProps {
  open: boolean;
  onClose: () => void;
  productionBudgets: ProductionBudget[];
  onCreateBudget: () => void;
  onEditBudget: (budget: ProductionBudget) => void;
  onDeleteBudget: (budget: ProductionBudget) => void;
  onRecalculateAllCosts: () => void;
  isRecalculating?: boolean;
}

const ProductionBudgetsDialog: React.FC<ProductionBudgetsDialogProps> = ({
  open,
  onClose,
  productionBudgets,
  onCreateBudget,
  onEditBudget,
  onDeleteBudget,
  onRecalculateAllCosts,
  isRecalculating = false,
}) => {
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            Presupuestos de Producción ({productionBudgets.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title="Recalcular todos los costos">
              <IconButton
                onClick={onRecalculateAllCosts}
                disabled={isRecalculating}
                size="small"
                sx={{ 
                  color: designTokens.colors.info.main,
                  '&:hover': { backgroundColor: designTokens.colors.info.light + '20' }
                }}
              >
                <CalculateIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateBudget}
              size="small"
              sx={{ borderRadius: designTokens.borderRadius.sm }}
            >
              Nuevo Presupuesto
            </Button>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <TableContainer component={Paper} elevation={0} sx={{ flex: 1, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Presupuesto de Producción
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Estado
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Costo Total
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Fecha de Creación
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 150 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Acciones
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productionBudgets.map((budget) => (
                  <TableRow 
                    key={budget.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: designTokens.colors.primary.light + '08',
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {budget.name}
                        </Typography>
                        {budget.description && (
                          <Typography variant="caption" color="text.secondary">
                            {budget.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(budget.status)}
                        size="small"
                        color={getStatusColor(budget.status) as any}
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        sx={{ color: designTokens.colors.success.main }}
                      >
                        {formatCOP(budget.total_cost_cop)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(budget.created_at).toLocaleDateString('es-CO')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Editar presupuesto">
                          <IconButton
                            onClick={() => onEditBudget(budget)}
                            size="small"
                            sx={{ color: designTokens.colors.primary.main }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar presupuesto">
                          <IconButton
                            onClick={() => onDeleteBudget(budget)}
                            size="small"
                            sx={{ color: designTokens.colors.error.main }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {productionBudgets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay presupuestos de producción registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${designTokens.colors.border.light}` }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductionBudgetsDialog;
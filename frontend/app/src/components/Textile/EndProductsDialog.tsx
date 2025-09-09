import React, { useState } from 'react';
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
  AttachMoney as AttachMoneyIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { EndProduct, BOMTemplate } from '@/types/textile';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import AdditionalCostsManagement from './AdditionalCostsManagement';

interface EndProductsDialogProps {
  open: boolean;
  onClose: () => void;
  endProducts: EndProduct[];
  bomTemplates: BOMTemplate[];
  onCreateEndProduct: () => void;
  onEditEndProduct: (endProduct: EndProduct) => void;
  onDeleteEndProduct: (endProduct: EndProduct) => void;
  onRecalculateAllCosts: () => void;
  isRecalculating?: boolean;
}

const EndProductsDialog: React.FC<EndProductsDialogProps> = ({
  open,
  onClose,
  endProducts,
  bomTemplates,
  onCreateEndProduct,
  onEditEndProduct,
  onDeleteEndProduct,
  onRecalculateAllCosts,
  isRecalculating = false,
}) => {
  const [selectedEndProduct, setSelectedEndProduct] = useState<EndProduct | null>(null);

  const getBOMTemplateName = (bomTemplateId?: number) => {
    if (!bomTemplateId) return '-';
    const template = bomTemplates.find(t => t.id === bomTemplateId);
    return template?.name || 'BOM no encontrada';
  };

  const handleCloseAdditionalCosts = () => {
    setSelectedEndProduct(null);
  };

  return (
    <>
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
              Productos Finales ({endProducts.length})
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
                onClick={onCreateEndProduct}
                size="small"
                sx={{ borderRadius: designTokens.borderRadius.sm }}
              >
                Nuevo Producto
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
                        Producto Final
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        BOM Template
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Costo Base
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Costo BOM
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Costos Adicionales
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Costo Total
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
                  {endProducts.map((endProduct) => (
                    <TableRow 
                      key={endProduct.id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: designTokens.colors.primary[100] + '08',
                        },
                      }}
                    >
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {endProduct.bom_template ? (
                          <Chip
                            label={getBOMTemplateName(endProduct.bom_template)}
                            size="small"
                            sx={{
                              backgroundColor: designTokens.colors.secondary[100] + '20',
                              color: designTokens.colors.secondary[600],
                              fontWeight: 'medium',
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin BOM
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main" fontWeight="medium">
                          {formatCOP(endProduct.base_cost_cop)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="secondary.main" fontWeight="medium">
                          {formatCOP(endProduct.bom_cost_cop)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="warning.main" fontWeight="medium">
                          {formatCOP(endProduct.additional_costs_cop)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1" 
                          fontWeight="bold" 
                          sx={{ color: designTokens.colors.success.main }}
                        >
                          {formatCOP(endProduct.total_cost_cop)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Editar producto">
                            <IconButton
                              onClick={() => onEditEndProduct(endProduct)}
                              size="small"
                              sx={{ color: designTokens.colors.primary.main }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gestionar costos adicionales">
                            <IconButton
                              onClick={() => setSelectedEndProduct(endProduct)}
                              size="small"
                              sx={{ color: designTokens.colors.warning.main }}
                            >
                              <AttachMoneyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar producto">
                            <IconButton
                              onClick={() => onDeleteEndProduct(endProduct)}
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
                  {endProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No hay productos finales registrados
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

      {/* Additional Costs Management Dialog */}
      {selectedEndProduct && (
        <Dialog
          open={true}
          onClose={handleCloseAdditionalCosts}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              height: '80vh',
              maxHeight: '80vh',
            },
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                Costos Adicionales - {selectedEndProduct.name}
              </Typography>
              <IconButton onClick={handleCloseAdditionalCosts} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <AdditionalCostsManagement 
              endProduct={selectedEndProduct}
              onAddAdditionalCost={() => {}}
              onEditAdditionalCost={() => {}}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseAdditionalCosts} variant="outlined">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default EndProductsDialog;
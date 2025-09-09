import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatCOPInput, isValidCOPAmount, formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';

export interface AdditionalCostItem {
  id?: number;
  name: string;
  value_cop: string;
  isNew?: boolean;
}

interface AdditionalCostsFormProps {
  additionalCosts: AdditionalCostItem[];
  onChange: (costs: AdditionalCostItem[]) => void;
}

const AdditionalCostsForm: React.FC<AdditionalCostsFormProps> = ({
  additionalCosts,
  onChange,
}) => {
  const [newCostName, setNewCostName] = useState('');
  const [newCostValue, setNewCostValue] = useState('');

  const addCost = () => {
    if (!newCostName.trim() || !newCostValue.trim() || !isValidCOPAmount(newCostValue)) {
      return;
    }

    const newCost: AdditionalCostItem = {
      id: Date.now(), // Temporary ID for new items
      name: newCostName.trim(),
      value_cop: newCostValue,
      isNew: true,
    };

    onChange([...additionalCosts, newCost]);
    setNewCostName('');
    setNewCostValue('');
  };

  const removeCost = (index: number) => {
    const updatedCosts = additionalCosts.filter((_, i) => i !== index);
    onChange(updatedCosts);
  };

  const handleValueChange = (value: string) => {
    const formattedValue = formatCOPInput(value);
    setNewCostValue(formattedValue);
  };

  const totalAdditionalCosts = additionalCosts.reduce(
    (sum, cost) => sum + (parseFloat(cost.value_cop) || 0),
    0
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Costos Adicionales
      </Typography>

      {/* Add New Cost Form */}
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: designTokens.colors.info.light + '10', 
          borderRadius: designTokens.borderRadius.sm,
          mb: 2 
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Agregar Nuevo Costo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Concepto"
            value={newCostName}
            onChange={(e) => setNewCostName(e.target.value)}
            placeholder="Ej: Packaging, Marketing, etc."
            size="small"
            sx={{ flex: 2 }}
          />
          <TextField
            label="Costo"
            value={newCostValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="0"
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: <span style={{ marginRight: 4 }}>$</span>,
            }}
          />
          <Button
            variant="contained"
            onClick={addCost}
            disabled={!newCostName.trim() || !newCostValue.trim() || !isValidCOPAmount(newCostValue)}
            startIcon={<AddIcon />}
            size="small"
          >
            Agregar
          </Button>
        </Box>
      </Box>

      {/* Costs Table */}
      {additionalCosts.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Concepto
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Costo
                  </Typography>
                </TableCell>
                <TableCell align="center" width={80}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Acciones
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {additionalCosts.map((cost, index) => (
                <TableRow key={cost.id || index}>
                  <TableCell>
                    <Typography variant="body2">
                      {cost.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {formatCOP(cost.value_cop)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Eliminar costo">
                      <IconButton
                        onClick={() => removeCost(index)}
                        size="small"
                        sx={{ color: designTokens.colors.error.main }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow sx={{ backgroundColor: designTokens.colors.success.light + '20' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Total Costos Adicionales
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                    {formatCOP(totalAdditionalCosts)}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {additionalCosts.length === 0 && (
        <Box 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            color: 'text.secondary',
            backgroundColor: designTokens.colors.border.light + '50',
            borderRadius: designTokens.borderRadius.sm,
            border: `1px dashed ${designTokens.colors.border.light}`,
          }}
        >
          <Typography variant="body2">
            No hay costos adicionales. Agrega costos como packaging, marketing, utilidades, etc.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdditionalCostsForm;
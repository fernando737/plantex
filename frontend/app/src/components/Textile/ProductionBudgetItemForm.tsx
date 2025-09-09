import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { designTokens } from '@/config';
import { ProductionBudgetItemFormData, ProductionBudget, EndProduct } from '@/types/textile';
import { useEndProducts } from '@/hooks/textile/useTextileApi';
import { formatCOP } from '@/utils/currency';

const validationSchema = yup.object({
  production_budget: yup.number().required('El presupuesto es obligatorio').positive('Debe seleccionar un presupuesto válido'),
  end_product: yup.number().required('El producto es obligatorio').positive('Debe seleccionar un producto válido'),
  planned_quantity: yup.number()
    .required('La cantidad es obligatoria')
    .positive('La cantidad debe ser mayor que 0')
    .integer('La cantidad debe ser un número entero'),
  cost_per_unit: yup.string()
    .required('El costo por unidad es obligatorio')
    .test('is-positive', 'El costo debe ser mayor que 0', (value) => {
      return value ? parseFloat(value) > 0 : false;
    }),
});

interface ProductionBudgetItemFormProps {
  initialData?: Partial<ProductionBudgetItemFormData>;
  productionBudget?: ProductionBudget;
  onSubmit: (data: ProductionBudgetItemFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductionBudgetItemForm: React.FC<ProductionBudgetItemFormProps> = ({
  initialData,
  productionBudget,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const endProductHooks = useEndProducts();
  const { data: endProductsResponse } = endProductHooks.useList();
  const endProducts = endProductsResponse?.results || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductionBudgetItemFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      production_budget: productionBudget?.id || initialData?.production_budget || 0,
      end_product: initialData?.end_product || 0,
      planned_quantity: initialData?.planned_quantity || 0,
      cost_per_unit: initialData?.cost_per_unit || '',
    },
  });

  const selectedEndProductId = watch('end_product');
  const plannedQuantity = watch('planned_quantity');
  const costPerUnit = watch('cost_per_unit');

  // Find the selected end product
  const selectedEndProduct = endProducts.find(product => product.id === selectedEndProductId);

  // Auto-populate cost per unit when end product is selected
  useEffect(() => {
    if (selectedEndProduct && !initialData?.cost_per_unit) {
      setValue('cost_per_unit', selectedEndProduct.total_cost_cop);
    }
  }, [selectedEndProduct, initialData, setValue]);

  // Calculate total cost
  const totalCost = plannedQuantity && costPerUnit 
    ? plannedQuantity * parseFloat(costPerUnit) 
    : 0;

  const handleFormSubmit = (data: ProductionBudgetItemFormData) => {
    onSubmit(data);
  };

  const isEdit = !!initialData?.end_product;

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: designTokens.colors.text.primary,
              fontWeight: designTokens.typography.fontWeight.semibold,
            }}
          >
            {isEdit ? 'Editar Item del Presupuesto' : 'Nuevo Item del Presupuesto'}
          </Typography>
          {productionBudget && (
            <Typography
              variant="body2"
              sx={{ 
                mb: 2,
                color: designTokens.colors.text.secondary,
                p: 2,
                backgroundColor: designTokens.colors.secondary[50],
                borderRadius: designTokens.borderRadius.sm,
              }}
            >
              <strong>Presupuesto:</strong> {productionBudget.name}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="end_product"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.end_product} disabled={loading}>
                <InputLabel>Producto Final *</InputLabel>
                <Select
                  {...field}
                  label="Producto Final *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <MenuItem value={0} disabled>
                    <em>Seleccionar producto final</em>
                  </MenuItem>
                  {endProducts.map((endProduct: EndProduct) => (
                    <MenuItem key={endProduct.id} value={endProduct.id}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {endProduct.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Costo unitario: {formatCOP(endProduct.total_cost_cop)}
                        </Typography>
                        {endProduct.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {endProduct.description.length > 60 
                              ? `${endProduct.description.substring(0, 57)}...` 
                              : endProduct.description}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.end_product && (
                  <FormHelperText>{errors.end_product.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="planned_quantity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cantidad a Producir *"
                fullWidth
                type="number"
                inputProps={{ min: "1", step: "1" }}
                error={!!errors.planned_quantity}
                helperText={errors.planned_quantity?.message}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.sm,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="cost_per_unit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Costo por Unidad * (COP)"
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                error={!!errors.cost_per_unit}
                helperText={errors.cost_per_unit?.message || 'Se actualizará automáticamente al seleccionar el producto'}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.sm,
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Product Details */}
        {selectedEndProduct && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: designTokens.colors.info.light + '20',
                borderRadius: designTokens.borderRadius.sm,
                border: `1px solid ${designTokens.colors.info.light}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Detalles del Producto:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Producto:</strong> {selectedEndProduct.name}
              </Typography>
              {selectedEndProduct.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Descripción:</strong> {selectedEndProduct.description}
                </Typography>
              )}
              <Typography variant="body2" color="success.main" fontWeight="medium">
                <strong>Costo unitario actual:</strong> {formatCOP(selectedEndProduct.total_cost_cop)}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Total Cost Preview */}
        {totalCost > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                backgroundColor: designTokens.colors.success.light + '15',
                borderRadius: designTokens.borderRadius.md,
                border: `1px solid ${designTokens.colors.success.light}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Resumen del Item
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {plannedQuantity} unidades × {formatCOP(parseFloat(costPerUnit))}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Costo Total del Item
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: designTokens.typography.fontWeight.bold,
                      color: designTokens.colors.success.main,
                    }}
                  >
                    {formatCOP(totalCost)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              gap: designTokens.spacing.sm,
              justifyContent: 'flex-end',
              pt: 2,
              borderTop: `1px solid ${designTokens.colors.border.light}`,
            }}
          >
            <Button
              type="button"
              onClick={onCancel}
              disabled={loading}
              sx={{
                borderRadius: designTokens.borderRadius.sm,
                minWidth: 100,
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: designTokens.borderRadius.sm,
                minWidth: 100,
              }}
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Agregar al Presupuesto'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionBudgetItemForm;
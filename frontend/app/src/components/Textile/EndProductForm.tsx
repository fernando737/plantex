import React, { useEffect, useState } from 'react';
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
  InputAdornment,
} from '@mui/material';
import { designTokens } from '@/config';
import { EndProductFormData, BOMTemplate } from '@/types/textile';
import { useBOMTemplates, useEndProducts } from '@/hooks/textile/useTextileApi';
import { formatCOPInput, isValidCOPAmount, formatCOP } from '@/utils/currency';

const validationSchema = yup.object({
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: yup.string().max(500, 'Máximo 500 caracteres').optional(),
  bom_template: yup.number().optional(),
});

interface EndProductFormProps {
  initialData?: Partial<EndProductFormData>;
  onSubmit: (data: EndProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const EndProductForm: React.FC<EndProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const bomTemplateHooks = useBOMTemplates();
  const endProductHooks = useEndProducts();
  const { data: bomTemplatesResponse, refetch: refetchBOMTemplates } = bomTemplateHooks.useList();
  const bomTemplates = bomTemplatesResponse?.results || [];

  
  const isEdit = !!(initialData?.name);
  const productId = (initialData as any)?.id;

  // Fetch detailed product data when editing (includes additional costs)
  const { data: detailedProduct } = endProductHooks.useDetail(productId || 0);
  

  // Force refresh BOM templates data when form opens (to get updated costs)
  useEffect(() => {
    refetchBOMTemplates();
  }, [refetchBOMTemplates]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EndProductFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      bom_template: initialData?.bom_template || undefined,
    },
  });

  const selectedBOMTemplateId = watch('bom_template');

  // Find selected BOM template for cost calculation
  const selectedBOMTemplate = bomTemplates.find(bom => bom.id === selectedBOMTemplateId);

  // Calculate total cost from BOM
  const bomCost = selectedBOMTemplate ? parseFloat(selectedBOMTemplate.total_cost_cop) : 0;
  const totalCost = bomCost;


  const handleFormSubmit = (data: EndProductFormData) => {
    // Convert empty BOM template to undefined
    const submitData = {
      ...data,
      bom_template: data.bom_template === 0 ? undefined : data.bom_template,
    };
    onSubmit(submitData);
  };


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
            {isEdit ? 'Editar Producto Final' : 'Nuevo Producto Final'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
                placeholder="Ej: Camisa Polo Azul Talla M, Pantalón Jean Clásico Talla 32, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.sm,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                multiline
                rows={3}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
                placeholder="Describe las características del producto final"
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
            name="bom_template"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth disabled={loading}>
                <InputLabel>BOM Template (Opcional)</InputLabel>
                <Select
                  {...field}
                  label="BOM Template (Opcional)"
                  value={field.value || 0}
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <MenuItem value={0}>
                    <em>Sin BOM Template</em>
                  </MenuItem>
                  {bomTemplates.map((bomTemplate: BOMTemplate) => (
                    <MenuItem key={bomTemplate.id} value={bomTemplate.id}>
                      <Box>
                        <Typography variant="body2">{bomTemplate.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Costo: {formatCOP(bomTemplate.total_cost_cop)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Seleccione una BOM para incluir automáticamente los costos de materiales
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>


        {/* Cost Breakdown */}
        {selectedBOMTemplate && bomCost > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                backgroundColor: designTokens.colors.info.light + '15',
                borderRadius: designTokens.borderRadius.md,
                border: `1px solid ${designTokens.colors.info.light}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Costo del Producto
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Costo BOM
                    </Typography>
                    <Typography variant="h6" color="secondary.main">
                      {formatCOP(bomCost)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedBOMTemplate.name}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Costo Total
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: designTokens.colors.success.main 
                      }}
                    >
                      {formatCOP(totalCost)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Producto'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EndProductForm;
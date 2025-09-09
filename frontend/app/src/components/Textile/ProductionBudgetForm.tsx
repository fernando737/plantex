import React from 'react';
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
  Chip,
} from '@mui/material';
import { designTokens } from '@/config';
import { ProductionBudgetFormData } from '@/types/textile';

const validationSchema = yup.object({
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: yup.string().max(500, 'Máximo 500 caracteres').optional(),
  status: yup.string().oneOf(['draft', 'approved', 'in_progress', 'completed'], 'Estado inválido').required('El estado es obligatorio'),
});

interface ProductionBudgetFormProps {
  initialData?: Partial<ProductionBudgetFormData>;
  onSubmit: (data: ProductionBudgetFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductionBudgetForm: React.FC<ProductionBudgetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductionBudgetFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'draft',
    },
  });

  const handleFormSubmit = (data: ProductionBudgetFormData) => {
    onSubmit(data);
  };

  const statusOptions = [
    { value: 'draft', label: 'Borrador', color: designTokens.colors.secondary[600] },
    { value: 'approved', label: 'Aprobado', color: designTokens.colors.success.main },
    { value: 'in_progress', label: 'En Progreso', color: designTokens.colors.warning.main },
    { value: 'completed', label: 'Completado', color: designTokens.colors.info.main },
  ];

  const getStatusColor = (status: string) => {
    return statusOptions.find(option => option.value === status)?.color || designTokens.colors.secondary[600];
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
            {initialData?.name ? 'Editar Presupuesto de Producción' : 'Nuevo Presupuesto de Producción'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={8}>
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
                placeholder="Ej: Colección Verano 2024, Producción Enero 2024, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.sm,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} disabled={loading}>
                <InputLabel>Estado *</InputLabel>
                <Select
                  {...field}
                  label="Estado *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                  renderValue={(value) => {
                    const option = statusOptions.find(opt => opt.value === value);
                    return option ? (
                      <Chip
                        label={option.label}
                        size="small"
                        sx={{
                          backgroundColor: option.color + '20',
                          color: option.color,
                          fontWeight: 'medium',
                          border: `1px solid ${option.color}40`,
                        }}
                      />
                    ) : value;
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: option.color,
                          }}
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>
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
                rows={4}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
                placeholder="Describe los objetivos y alcance de este presupuesto de producción"
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
          <Box
            sx={{
              p: 3,
              backgroundColor: designTokens.colors.info.light + '15',
              borderRadius: designTokens.borderRadius.md,
              border: `1px solid ${designTokens.colors.info.light}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
              Estados del Presupuesto
            </Typography>
            
            <Grid container spacing={2}>
              {statusOptions.map((option) => (
                <Grid item xs={12} sm={6} md={3} key={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: option.color,
                      }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      {option.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {option.value === 'draft' && 'Presupuesto en preparación'}
                    {option.value === 'approved' && 'Listo para producción'}
                    {option.value === 'in_progress' && 'Producción en curso'}
                    {option.value === 'completed' && 'Producción terminada'}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              backgroundColor: designTokens.colors.warning.light + '20',
              borderRadius: designTokens.borderRadius.sm,
              border: `1px solid ${designTokens.colors.warning.light}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Nota:</strong> Después de crear el presupuesto podrá agregar productos finales 
              con sus cantidades. Los costos se calcularán automáticamente basándose en los precios 
              de los productos y sus componentes.
            </Typography>
          </Box>
        </Grid>

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
              {loading ? 'Guardando...' : initialData?.name ? 'Actualizar' : 'Crear Presupuesto'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionBudgetForm;
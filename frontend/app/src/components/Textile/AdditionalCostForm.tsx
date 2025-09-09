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
  InputAdornment,
} from '@mui/material';
import { designTokens } from '@/config';
import { AdditionalCostFormData, EndProduct } from '@/types/textile';
import { formatCOPInput, isValidCOPAmount } from '@/utils/currency';

const validationSchema = yup.object({
  end_product: yup.number().required('El producto es obligatorio').positive('Debe seleccionar un producto válido'),
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  cost: yup.string()
    .required('El costo es obligatorio')
    .test('is-valid-amount', 'El costo debe ser un número válido mayor que 0', (value) => {
      return value ? isValidCOPAmount(value) && parseFloat(value) > 0 : false;
    }),
});

interface AdditionalCostFormProps {
  initialData?: Partial<AdditionalCostFormData>;
  endProduct?: EndProduct;
  onSubmit: (data: AdditionalCostFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AdditionalCostForm: React.FC<AdditionalCostFormProps> = ({
  initialData,
  endProduct,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AdditionalCostFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      end_product: endProduct?.id || initialData?.end_product || 0,
      name: initialData?.name || '',
      cost: initialData?.cost || '',
    },
  });

  const handleCostChange = (value: string) => {
    const formattedValue = formatCOPInput(value);
    setValue('cost', formattedValue);
  };

  const handleFormSubmit = (data: AdditionalCostFormData) => {
    onSubmit(data);
  };

  const isEdit = !!initialData?.name;

  // Common additional cost suggestions
  const costSuggestions = [
    'Packaging',
    'Etiquetado',
    'Marketing',
    'Comisión de ventas',
    'Utilidad',
    'Transporte',
    'Almacenamiento',
    'Seguro',
    'Impuestos',
    'Acabados especiales',
  ];

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
            {isEdit ? 'Editar Costo Adicional' : 'Nuevo Costo Adicional'}
          </Typography>
          {endProduct && (
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
              <strong>Producto:</strong> {endProduct.name}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={8}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Concepto *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
                placeholder="Ej: Packaging, Marketing, Utilidad, etc."
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
            name="cost"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <TextField
                {...field}
                label="Costo *"
                fullWidth
                error={!!errors.cost}
                helperText={errors.cost?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">COP $</InputAdornment>,
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  handleCostChange(value);
                  onChange(value);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: designTokens.borderRadius.sm,
                  },
                }}
              />
            )}
          />
        </Grid>

        {/* Cost Suggestions */}
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
              Conceptos comunes:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {costSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outlined"
                  size="small"
                  onClick={() => setValue('name', suggestion)}
                  disabled={loading}
                  sx={{ 
                    borderRadius: designTokens.borderRadius.sm,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Haga clic en cualquier concepto para agregarlo automáticamente
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Agregar Costo'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdditionalCostForm;
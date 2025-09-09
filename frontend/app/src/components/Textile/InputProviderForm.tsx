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
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { designTokens } from '@/config';
import { InputProviderFormData, Provider, Input } from '@/types/textile';
import { useProviders } from '@/hooks/textile/useTextileApi';
import { formatCOPInput, isValidCOPAmount } from '@/utils/currency';

const validationSchema = yup.object({
  input: yup.number().required('El insumo es obligatorio').positive('Debe seleccionar un insumo válido'),
  provider: yup.number().required('El proveedor es obligatorio').positive('Debe seleccionar un proveedor válido'),
  price_per_unit_cop: yup.string()
    .required('El precio es obligatorio')
    .test('is-valid-amount', 'El precio debe ser un número válido mayor que 0', (value) => {
      return value ? isValidCOPAmount(value) && parseFloat(value) > 0 : false;
    }),
  is_preferred: yup.boolean().optional(),
  notes: yup.string().max(500, 'Máximo 500 caracteres').optional(),
});

interface InputProviderFormProps {
  initialData?: Partial<InputProviderFormData>;
  input?: Input;
  onSubmit: (data: InputProviderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const InputProviderForm: React.FC<InputProviderFormProps> = ({
  initialData,
  input,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const providerHooks = useProviders();
  const { data: providersResponse } = providerHooks.useList();
  const providers = providersResponse?.results || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InputProviderFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      input: input?.id || initialData?.input || 0,
      provider: initialData?.provider || 0,
      price_per_unit_cop: initialData?.price_per_unit_cop || '',
      is_preferred: initialData?.is_preferred || false,
      notes: initialData?.notes || '',
    },
  });

  const priceValue = watch('price_per_unit_cop');

  const handlePriceChange = (value: string) => {
    const formattedValue = formatCOPInput(value);
    setValue('price_per_unit_cop', formattedValue);
  };

  const handleFormSubmit = (data: InputProviderFormData) => {
    onSubmit(data);
  };

  const isEdit = !!initialData?.provider;

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
            {isEdit ? 'Editar Precio' : 'Nuevo Precio'}
          </Typography>
          {input && (
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
              <strong>Insumo:</strong> {input.name}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.provider} disabled={loading}>
                <InputLabel>Proveedor *</InputLabel>
                <Select
                  {...field}
                  label="Proveedor *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <MenuItem value={0} disabled>
                    <em>Seleccionar proveedor</em>
                  </MenuItem>
                  {providers.map((provider: Provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.provider && (
                  <FormHelperText>{errors.provider.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="price_per_unit_cop"
            control={control}
            render={({ field: { onChange, ...field } }) => (
              <TextField
                {...field}
                label="Precio por Unidad *"
                fullWidth
                error={!!errors.price_per_unit_cop}
                helperText={errors.price_per_unit_cop?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">COP $</InputAdornment>,
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  handlePriceChange(value);
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

        <Grid item xs={12}>
          <Controller
            name="is_preferred"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value || false}
                    disabled={loading}
                    sx={{
                      color: designTokens.colors.primary[500],
                      '&.Mui-checked': {
                        color: designTokens.colors.primary[600],
                      },
                    }}
                  />
                }
                label="Proveedor preferido para este insumo"
                sx={{
                  color: designTokens.colors.text.primary,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notas"
                multiline
                rows={3}
                fullWidth
                error={!!errors.notes}
                helperText={errors.notes?.message}
                disabled={loading}
                placeholder="Notas adicionales sobre este precio (opcional)"
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InputProviderForm;
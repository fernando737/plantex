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
  Chip,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { designTokens } from '@/config';
import { BOMItemFormData, BOMTemplate, Input, Unit, InputProvider, Provider } from '@/types/textile';
import { useInputs, useUnits, useInputProviders, useProviders } from '@/hooks/textile/useTextileApi';
import { formatCOP } from '@/utils/currency';

const validationSchema = yup.object({
  bom_template: yup.number().required('La BOM es obligatoria').positive('Debe seleccionar una BOM válida'),
  input: yup.number().required('El insumo es obligatorio').positive('Debe seleccionar un insumo válido'),
  input_provider: yup.number().required('El proveedor es obligatorio').positive('Debe seleccionar un proveedor válido'),
  quantity: yup.string()
    .required('La cantidad es obligatoria')
    .test('is-positive', 'La cantidad debe ser mayor que 0', (value) => {
      return value ? parseFloat(value) > 0 : false;
    }),
});

interface BOMItemFormProps {
  initialData?: Partial<BOMItemFormData>;
  bomTemplate?: BOMTemplate;
  onSubmit: (data: BOMItemFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BOMItemForm: React.FC<BOMItemFormProps> = ({
  initialData,
  bomTemplate,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const inputHooks = useInputs();
  const unitHooks = useUnits();
  const inputProviderHooks = useInputProviders();
  const providerHooks = useProviders();
  
  const { data: inputsResponse } = inputHooks.useList();
  const { data: unitsResponse } = unitHooks.useList();
  const { data: providersResponse } = providerHooks.useList();
  
  const inputs = inputsResponse?.results || [];
  const units = unitsResponse?.results || [];
  const providers = providersResponse?.results || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BOMItemFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      bom_template: bomTemplate?.id || initialData?.bom_template || 0,
      input: initialData?.input || 0,
      input_provider: initialData?.input_provider || 0,
      quantity: initialData?.quantity || '',
    },
  });

  const selectedInputId = watch('input');
  const selectedInputProviderId = watch('input_provider');
  const quantity = watch('quantity');

  // Get input provider prices for the selected input
  const { data: inputProvidersResponse } = inputProviderHooks.useList(
    selectedInputId ? { input: selectedInputId } : undefined
  );
  const inputProviders = inputProvidersResponse?.results || [];

  // Find the selected input and provider details
  const selectedInput = inputs.find(input => input.id === selectedInputId);
  const selectedUnit = selectedInput ? units.find(unit => unit.id === selectedInput.unit) : null;
  const selectedInputProvider = inputProviders.find(ip => ip.id === selectedInputProviderId);
  const selectedProvider = selectedInputProvider ? providers.find(p => p.id === selectedInputProvider.provider) : null;

  // Calculate total cost
  const totalCost = quantity && selectedInputProvider 
    ? parseFloat(quantity) * parseFloat(selectedInputProvider.price_per_unit_cop) 
    : 0;

  // Reset provider selection when input changes
  useEffect(() => {
    if (selectedInputId && !initialData?.input_provider) {
      setValue('input_provider', 0);
    }
  }, [selectedInputId, initialData, setValue]);

  const handleFormSubmit = (data: BOMItemFormData) => {
    onSubmit(data);
  };

  const isEdit = !!initialData?.input;

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
            {isEdit ? 'Editar Item de BOM' : 'Nuevo Item de BOM'}
          </Typography>
          {bomTemplate && (
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
              <strong>BOM:</strong> {bomTemplate.name}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="input"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.input} disabled={loading}>
                <InputLabel>Insumo *</InputLabel>
                <Select
                  {...field}
                  label="Insumo *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <MenuItem value={0} disabled>
                    <em>Seleccionar insumo</em>
                  </MenuItem>
                  {inputs.map((input: Input) => {
                    const unit = units.find(u => u.id === input.unit);
                    return (
                      <MenuItem key={input.id} value={input.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography>{input.name}</Typography>
                          {unit && (
                            <Chip
                              label={`${unit.abbreviation}`}
                              size="small"
                              sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.input && (
                  <FormHelperText>{errors.input.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="input_provider"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.input_provider} disabled={loading || !selectedInputId}>
                <InputLabel>Proveedor *</InputLabel>
                <Select
                  {...field}
                  label="Proveedor *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <MenuItem value={0} disabled>
                    <em>
                      {!selectedInputId 
                        ? "Seleccione primero un insumo"
                        : inputProviders.length === 0 
                        ? "No hay proveedores para este insumo"
                        : "Seleccionar proveedor"
                      }
                    </em>
                  </MenuItem>
                  {inputProviders.map((inputProvider) => {
                    const provider = providers.find(p => p.id === inputProvider.provider);
                    return (
                      <MenuItem key={inputProvider.id} value={inputProvider.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Typography>{provider?.name || 'Proveedor desconocido'}</Typography>
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={formatCOP(inputProvider.price_per_unit_cop)}
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            {inputProvider.is_preferred && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StarIcon sx={{ color: designTokens.colors.warning.main, fontSize: '0.8rem' }} />
                                <Typography variant="caption" color="warning.main" fontSize="0.7rem" fontWeight="medium">
                                  Preferido
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.input_provider && (
                  <FormHelperText>{errors.input_provider.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={`Cantidad Necesaria * ${selectedUnit ? `(${selectedUnit.abbreviation})` : ''}`}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
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

        {/* Selected Provider Preview */}
        {selectedInputProvider && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: designTokens.colors.info.light + '10',
                borderRadius: designTokens.borderRadius.sm,
                border: `1px solid ${designTokens.colors.info.light}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium', color: designTokens.colors.info.dark }}>
                Proveedor seleccionado:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  <strong>{selectedProvider?.name}</strong>
                </Typography>
                <Chip
                  label={formatCOP(selectedInputProvider.price_per_unit_cop)}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                {selectedInputProvider.is_preferred && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ color: designTokens.colors.warning.main, fontSize: '1rem' }} />
                    <Typography variant="caption" color="warning.main" fontWeight="medium">
                      Preferido
                    </Typography>
                  </Box>
                )}
              </Box>
              {selectedInputProvider.notes && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Notas: {selectedInputProvider.notes}
                </Typography>
              )}
            </Box>
          </Grid>
        )}

        {/* Total Cost Preview */}
        {totalCost > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                backgroundColor: designTokens.colors.success.light + '20',
                borderRadius: designTokens.borderRadius.sm,
                border: `1px solid ${designTokens.colors.success.light}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Costo Total del Item:
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: designTokens.typography.fontWeight.bold,
                  color: designTokens.colors.success.main,
                }}
              >
                {formatCOP(totalCost)}
              </Typography>
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
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Agregar Item'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BOMItemForm;
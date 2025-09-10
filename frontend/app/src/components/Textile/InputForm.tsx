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
} from '@mui/material';
import { designTokens } from '@/config';
import { InputFormData, Unit } from '@/types/textile';
import { useUnits } from '@/hooks/textile/useTextileApi';

const validationSchema = yup.object({
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: yup.string().max(500, 'Máximo 500 caracteres').optional(),
  input_type: yup.string().oneOf(['confection', 'supply', 'fabric', 'process'], 'Seleccione un tipo válido').required('El tipo de insumo es obligatorio'),
  unit: yup.number().required('La unidad es obligatoria').positive('Debe seleccionar una unidad válida'),
});

const inputTypeOptions = [
  { value: 'confection', label: 'Confección' },
  { value: 'supply', label: 'Insumo' },
  { value: 'fabric', label: 'Telas' },
  { value: 'process', label: 'Procesos' },
];

interface InputFormProps {
  initialData?: Partial<InputFormData>;
  onSubmit: (data: InputFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const unitHooks = useUnits();
  const { data: unitsResponse } = unitHooks.useList();
  const units = unitsResponse?.results || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InputFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      input_type: initialData?.input_type || 'supply',
      unit: initialData?.unit || 0,
    },
  });

  const handleFormSubmit = (data: InputFormData) => {
    onSubmit(data);
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
            {initialData?.name ? 'Editar Insumo' : 'Nuevo Insumo'}
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
            name="input_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.input_type} disabled={loading}>
                <InputLabel>Tipo de Insumo *</InputLabel>
                <Select
                  {...field}
                  label="Tipo de Insumo *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  {inputTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.input_type && (
                  <FormHelperText>{errors.input_type.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.unit} disabled={loading}>
                <InputLabel>Unidad *</InputLabel>
                <Select
                  {...field}
                  label="Unidad *"
                  sx={{
                    borderRadius: designTokens.borderRadius.sm,
                  }}
                >
                  <MenuItem value={0} disabled>
                    <em>Seleccionar unidad</em>
                  </MenuItem>
                  {units.map((unit: Unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name_es} ({unit.abbreviation})
                    </MenuItem>
                  ))}
                </Select>
                {errors.unit && (
                  <FormHelperText>{errors.unit.message}</FormHelperText>
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
                rows={3}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
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
              {loading ? 'Guardando...' : initialData?.name ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InputForm;
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
} from '@mui/material';
import { designTokens } from '@/config';
import { ProviderFormData } from '@/types/textile';

const validationSchema = yup.object({
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  email: yup.string().email('Email inválido').optional(),
  phone_number: yup.string().max(20, 'Máximo 20 caracteres').optional(),
  address: yup.string().max(500, 'Máximo 500 caracteres').optional(),
  notes: yup.string().max(1000, 'Máximo 1000 caracteres').optional(),
});


interface ProviderFormProps {
  initialData?: Partial<ProviderFormData>;
  onSubmit: (data: ProviderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProviderForm: React.FC<ProviderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone_number: initialData?.phone_number || '',
      address: initialData?.address || '',
      notes: initialData?.notes || '',
    },
  });

  const handleFormSubmit = (data: ProviderFormData) => {
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
            {initialData?.name ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email de Contacto"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
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
            name="phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Teléfono de Contacto"
                fullWidth
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
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
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dirección"
                multiline
                rows={2}
                fullWidth
                error={!!errors.address}
                helperText={errors.address?.message}
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

export default ProviderForm;
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
import { BOMTemplateFormData } from '@/types/textile';

const validationSchema = yup.object({
  name: yup.string().required('El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: yup.string().max(500, 'Máximo 500 caracteres').optional(),
});

interface BOMTemplateFormProps {
  initialData?: Partial<BOMTemplateFormData>;
  onSubmit: (data: BOMTemplateFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BOMTemplateForm: React.FC<BOMTemplateFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BOMTemplateFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const handleFormSubmit = (data: BOMTemplateFormData) => {
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
            {initialData?.name ? 'Editar BOM' : 'Nueva BOM'}
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
                placeholder="Ej: Camisa básica talla M, Pantalón de vestir, etc."
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
                rows={4}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
                placeholder="Describe detalladamente los materiales y procesos incluidos en esta BOM"
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
              p: 2,
              backgroundColor: designTokens.colors.info.light + '20',
              borderRadius: designTokens.borderRadius.sm,
              border: `1px solid ${designTokens.colors.info.light}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Nota:</strong> Después de crear la BOM podrá agregar los insumos necesarios y sus cantidades. 
              Los costos se calcularán automáticamente basándose en los precios de los proveedores.
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
              {loading ? 'Guardando...' : initialData?.name ? 'Actualizar' : 'Crear BOM'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BOMTemplateForm;
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useProviders } from '@/hooks/textile/useTextileApi';
import { Provider } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import { designTokens } from '@/config';
import toast from 'react-hot-toast';

interface ProvidersViewProps {
  onCreateProvider?: () => void;
  onEditProvider?: (provider: Provider) => void;
}

const ProvidersView: React.FC<ProvidersViewProps> = ({
  onCreateProvider,
  onEditProvider,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);

  const providerHooks = useProviders();
  const { data: providersResponse, isLoading } = providerHooks.useList();
  const deleteProvider = providerHooks.useDelete(providerToDelete?.id || 0);

  const providers = providersResponse?.results || [];

  const handleDeleteClick = (provider: Provider) => {
    setProviderToDelete(provider);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;

    try {
      await deleteProvider.mutateAsync();
      toast.success('Proveedor eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setProviderToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el proveedor');
      console.error('Delete provider error:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setProviderToDelete(null);
  };

  const columns = [
    {
      id: 'name',
      label: 'Nombre',
      render: (provider: Provider) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ color: designTokens.colors.primary[500], fontSize: '1.2rem' }} />
          <Typography variant="body2" fontWeight="medium">
            {provider.name}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      render: (provider: Provider) => provider.email || '—',
    },
    {
      id: 'phone_number',
      label: 'Teléfono',
      render: (provider: Provider) => provider.phone_number || '—',
    },
    {
      id: 'address',
      label: 'Dirección',
      render: (provider: Provider) => {
        const address = provider.address || '—';
        return address.length > 50 ? `${address.substring(0, 47)}...` : address;
      },
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (provider: Provider) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Editar proveedor">
            <IconButton
              size="small"
              onClick={() => onEditProvider?.(provider)}
              sx={{
                color: designTokens.colors.primary[600],
                '&:hover': { backgroundColor: designTokens.colors.primary[50] },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar proveedor">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(provider)}
              sx={{
                color: designTokens.colors.error.main,
                '&:hover': { backgroundColor: designTokens.colors.error.light + '20' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.text.primary,
                mb: 0.5,
              }}
            >
              Proveedores
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: designTokens.colors.text.secondary }}
            >
              Gestiona los proveedores de materiales e insumos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateProvider}
            sx={{
              borderRadius: designTokens.borderRadius.md,
              px: 3,
            }}
          >
            Nuevo Proveedor
          </Button>
        </Box>

        {/* Providers Table */}
        <Paper
          sx={{
            borderRadius: designTokens.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <DataTableSimple
            data={providers}
            columns={columns}
            loading={isLoading}
            emptyMessage="No hay proveedores registrados"
          />
        </Paper>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmOpen}
          title="Eliminar Proveedor"
          message={`¿Está seguro que desea eliminar el proveedor "${providerToDelete?.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          severity="error"
          loading={deleteProvider.isPending}
        />
      </Box>
    </Container>
  );
};

export default ProvidersView;
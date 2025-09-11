import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  MoreVert as MoreVertIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  GetApp as TemplateIcon,
} from '@mui/icons-material';
import { useProviders, useProviderCSVOperations } from '@/hooks/textile/useTextileApi';
import { Provider, CSVImportResponse, CSVImportOptions } from '@/types/textile';
import DataTableSimple from '@/components/Common/DataTableSimple';
import ConfirmationDialog from '@/components/Common/ConfirmationDialog';
import CSVImportModal from '@/components/Textile/CSVImportModal';
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
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvMenuAnchor, setCsvMenuAnchor] = useState<null | HTMLElement>(null);
  const [importResult, setImportResult] = useState<CSVImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const providerHooks = useProviders();
  const { data: providersResponse, isLoading, refetch } = providerHooks.useList();
  const deleteProvider = providerHooks.useDelete(providerToDelete?.id || 0);
  
  // CSV Operations
  const csvOperations = useProviderCSVOperations();
  const importCSV = csvOperations.useImportCSV();
  const exportCSV = csvOperations.useExportCSV();
  const downloadTemplate = csvOperations.useDownloadTemplate();

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

  // CSV Menu Handlers
  const handleCsvMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCsvMenuAnchor(event.currentTarget);
  };

  const handleCsvMenuClose = () => {
    setCsvMenuAnchor(null);
  };

  // CSV Import Handlers
  const handleImportCSV = async (file: File, options: CSVImportOptions) => {
    try {
      setImportError(null);
      const result = await importCSV.mutateAsync({ file, options });
      setImportResult(result);
      
      if (!result.validate_only && result.error_count === 0) {
        toast.success(`✓ ${result.imported_count} proveedores importados exitosamente`);
        refetch(); // Refresh the providers list
        setTimeout(() => {
          setCsvImportOpen(false);
          setImportResult(null);
        }, 2000);
      } else if (result.validate_only && result.error_count === 0) {
        toast.success(`✓ Validación exitosa - ${result.imported_count} registros listos para importar`);
      } else if (result.error_count > 0) {
        toast.warning(`Importación completada con ${result.error_count} errores`);
        if (!result.validate_only) {
          refetch();
        }
      }
    } catch (error: any) {
      console.error('CSV import error:', error);
      const errorMessage = error.response?.data?.error || 'Error al importar el archivo CSV';
      setImportError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleOpenImportModal = () => {
    setImportResult(null);
    setImportError(null);
    setCsvImportOpen(true);
    handleCsvMenuClose();
  };

  const handleCloseImportModal = () => {
    setCsvImportOpen(false);
    setImportResult(null);
    setImportError(null);
  };

  // CSV Export Handlers
  const handleExportCSV = async () => {
    try {
      await exportCSV.mutateAsync();
      toast.success('Archivo CSV exportado exitosamente');
    } catch (error: any) {
      console.error('CSV export error:', error);
      toast.error('Error al exportar el archivo CSV');
    }
    handleCsvMenuClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate.mutateAsync();
      toast.success('Plantilla CSV descargada');
    } catch (error: any) {
      console.error('Template download error:', error);
      toast.error('Error al descargar la plantilla');
    }
    handleCsvMenuClose();
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<MoreVertIcon />}
              onClick={handleCsvMenuOpen}
              sx={{
                borderRadius: designTokens.borderRadius.md,
                px: 2,
              }}
            >
              CSV
            </Button>
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

        {/* CSV Operations Menu */}
        <Menu
          anchorEl={csvMenuAnchor}
          open={Boolean(csvMenuAnchor)}
          onClose={handleCsvMenuClose}
          PaperProps={{
            sx: {
              borderRadius: designTokens.borderRadius.md,
              mt: 1,
            }
          }}
        >
          <MenuItem onClick={handleOpenImportModal}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText primary="Importar CSV" />
          </MenuItem>
          
          <MenuItem 
            onClick={handleExportCSV}
            disabled={exportCSV.isPending}
          >
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText primary="Exportar CSV" />
          </MenuItem>
          
          <MenuItem 
            onClick={handleDownloadTemplate}
            disabled={downloadTemplate.isPending}
          >
            <ListItemIcon>
              <TemplateIcon />
            </ListItemIcon>
            <ListItemText primary="Descargar Plantilla" />
          </MenuItem>
        </Menu>

        {/* CSV Import Modal */}
        <CSVImportModal
          open={csvImportOpen}
          onClose={handleCloseImportModal}
          onImport={handleImportCSV}
          onDownloadTemplate={handleDownloadTemplate}
          isImporting={importCSV.isPending}
          importResult={importResult}
          importError={importError}
          title="Importar Proveedores desde CSV"
          description="Sube un archivo CSV con los datos de los proveedores para importar al sistema."
        />
      </Box>
    </Container>
  );
};

export default ProvidersView;
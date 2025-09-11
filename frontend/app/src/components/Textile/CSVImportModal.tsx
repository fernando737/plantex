import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { designTokens } from '@/config';
import { CSVImportResponse, CSVImportOptions } from '@/types/textile';
import CSVUploadComponent from '@/components/Common/CSVUploadComponent';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File, options: CSVImportOptions) => void;
  onDownloadTemplate: () => void;
  isImporting: boolean;
  importResult?: CSVImportResponse | null;
  importError?: string | null;
  title?: string;
  description?: string;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  open,
  onClose,
  onImport,
  onDownloadTemplate,
  isImporting,
  importResult,
  importError,
  title = 'Importar Proveedores desde CSV',
  description = 'Sube un archivo CSV con los datos de los proveedores para importar al sistema.',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<CSVImportOptions>({
    validate_only: false,
    skip_duplicates: true,
    continue_on_error: true,
  });

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile, options);
    }
  };

  const handleValidate = () => {
    if (selectedFile) {
      onImport(selectedFile, { ...options, validate_only: true });
    }
  };

  const getResultIcon = (result: CSVImportResponse) => {
    if (result.validate_only) {
      return result.error_count === 0 
        ? <SuccessIcon sx={{ color: designTokens.colors.success.main }} />
        : <WarningIcon sx={{ color: designTokens.colors.warning.main }} />;
    } else {
      return result.error_count === 0 
        ? <SuccessIcon sx={{ color: designTokens.colors.success.main }} />
        : <WarningIcon sx={{ color: designTokens.colors.warning.main }} />;
    }
  };

  const getResultSeverity = (result: CSVImportResponse) => {
    if (result.error_count === 0) {
      return result.validate_only ? 'info' : 'success';
    } else {
      return 'warning';
    }
  };

  const getResultMessage = (result: CSVImportResponse) => {
    if (result.validate_only) {
      return result.error_count === 0 
        ? `✓ Validación exitosa - ${result.imported_count} registros listos para importar`
        : `Validación completada con ${result.error_count} errores`;
    } else {
      return result.error_count === 0 
        ? `✓ Importación exitosa - ${result.imported_count} proveedores importados`
        : `Importación completada con ${result.error_count} errores - ${result.imported_count} proveedores importados`;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: designTokens.borderRadius.lg,
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Template Download Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ¿Necesitas una plantilla?
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownloadTemplate}
              sx={{ mb: 2 }}
            >
              Descargar Plantilla CSV
            </Button>
            <Typography variant="caption" display="block" color="text.secondary">
              Descarga una plantilla con el formato correcto y datos de ejemplo.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* File Upload Section */}
          <CSVUploadComponent
            onFileSelect={setSelectedFile}
            isUploading={isImporting}
            error={importError}
            helperText="El archivo debe tener las columnas: Nombre, Email, Teléfono, Dirección, Notas"
          />

          {/* Import Options */}
          {selectedFile && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Opciones de Importación
              </Typography>
              
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.skip_duplicates}
                      onChange={(e) => 
                        setOptions({ ...options, skip_duplicates: e.target.checked })
                      }
                    />
                  }
                  label="Omitir registros duplicados"
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.continue_on_error}
                      onChange={(e) => 
                        setOptions({ ...options, continue_on_error: e.target.checked })
                      }
                    />
                  }
                  label="Continuar importación si hay errores"
                />
              </Stack>
            </Box>
          )}

          {/* Import Results */}
          {importResult && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                severity={getResultSeverity(importResult)}
                icon={getResultIcon(importResult)}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  {getResultMessage(importResult)}
                </Typography>
                
                {/* Statistics */}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip 
                    label={`${importResult.imported_count} procesados`}
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  {importResult.skipped_count > 0 && (
                    <Chip 
                      label={`${importResult.skipped_count} omitidos`}
                      size="small" 
                      color="warning" 
                      variant="outlined"
                    />
                  )}
                  {importResult.error_count > 0 && (
                    <Chip 
                      label={`${importResult.error_count} errores`}
                      size="small" 
                      color="error" 
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Alert>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Ver errores ({importResult.errors.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={
                              <Typography variant="body2" color="error">
                                {error}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {importResult.errors.length > 10 && (
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="caption" color="text.secondary">
                                ...y {importResult.errors.length - 10} errores más
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {importResult?.error_count === 0 && !importResult?.validate_only ? 'Cerrar' : 'Cancelar'}
        </Button>
        
        {selectedFile && !importResult && (
          <>
            <Button
              onClick={handleValidate}
              disabled={isImporting}
              variant="outlined"
            >
              Validar
            </Button>
            <Button
              onClick={handleImport}
              disabled={isImporting}
              variant="contained"
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </>
        )}

        {importResult?.validate_only && importResult.error_count === 0 && (
          <Button
            onClick={handleImport}
            disabled={isImporting}
            variant="contained"
            color="success"
          >
            {isImporting ? 'Importando...' : 'Confirmar Importación'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImportModal;
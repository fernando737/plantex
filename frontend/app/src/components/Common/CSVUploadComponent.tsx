import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { designTokens } from '@/config';

interface CSVUploadComponentProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  error?: string | null;
  accept?: string;
  maxSize?: number; // in bytes
  helperText?: string;
}

const CSVUploadComponent: React.FC<CSVUploadComponentProps> = ({
  onFileSelect,
  isUploading = false,
  error,
  accept = '.csv',
  maxSize = 5 * 1024 * 1024, // 5MB default
  helperText = 'Arrastra y suelta tu archivo CSV aquí, o haz clic para seleccionar'
}) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors) {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          setUploadError(`El archivo es muy grande. Tamaño máximo: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
        } else if (error.code === 'file-invalid-type') {
          setUploadError('Tipo de archivo no válido. Solo se permiten archivos CSV.');
        } else {
          setUploadError('Error al cargar el archivo.');
        }
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    maxSize,
    disabled: isUploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDropzoneStyles = () => {
    let borderColor = designTokens.colors.border.light;
    let backgroundColor = designTokens.colors.background.paper;
    
    if (isDragActive && !isDragReject) {
      borderColor = designTokens.colors.primary[300];
      backgroundColor = designTokens.colors.primary[50];
    } else if (isDragReject || error || uploadError) {
      borderColor = designTokens.colors.error.main;
      backgroundColor = designTokens.colors.error.light + '10';
    }

    return {
      borderColor,
      backgroundColor,
      cursor: isUploading ? 'not-allowed' : 'pointer',
      opacity: isUploading ? 0.6 : 1,
    };
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          border: '2px dashed',
          borderRadius: designTokens.borderRadius.lg,
          p: 4,
          textAlign: 'center',
          transition: 'all 0.2s ease-in-out',
          ...getDropzoneStyles(),
        }}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <Box>
            <CloudUploadIcon 
              sx={{ 
                fontSize: '3rem', 
                color: designTokens.colors.primary[400],
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              Subiendo archivo...
            </Typography>
            <LinearProgress sx={{ mt: 2, mb: 1 }} />
          </Box>
        ) : selectedFile ? (
          <Box>
            <SuccessIcon 
              sx={{ 
                fontSize: '3rem', 
                color: designTokens.colors.success.main,
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              Archivo seleccionado
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <FileIcon sx={{ color: designTokens.colors.text.secondary }} />
              <Typography variant="body1">
                {selectedFile.name}
              </Typography>
              <Chip 
                label={formatFileSize(selectedFile.size)} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Stack>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon 
              sx={{ 
                fontSize: '3rem', 
                color: isDragActive 
                  ? designTokens.colors.primary[500] 
                  : designTokens.colors.text.secondary,
                mb: 2 
              }} 
            />
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ color: designTokens.colors.text.primary }}
            >
              {isDragActive 
                ? 'Suelta el archivo aquí...' 
                : 'Cargar archivo CSV'
              }
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: designTokens.colors.text.secondary,
                mb: 2 
              }}
            >
              {helperText}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1 }}
            >
              Seleccionar archivo
            </Button>
          </Box>
        )}
      </Paper>

      {/* Error Messages */}
      {(error || uploadError) && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          icon={<ErrorIcon />}
        >
          {error || uploadError}
        </Alert>
      )}

      {/* File Requirements */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          • Formatos soportados: CSV (.csv)
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          • Tamaño máximo: {(maxSize / (1024 * 1024)).toFixed(1)}MB
        </Typography>
      </Box>
    </Box>
  );
};

export default CSVUploadComponent;
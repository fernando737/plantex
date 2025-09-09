import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Assessment as ReportsIcon } from '@mui/icons-material';
import { designTokens } from '@/config';
import { ReportType } from './utils/reportTypes';

interface ReportSelectorProps {
  onViewReport: (reportType: ReportType) => void;
  onExportPDF: (reportType: ReportType) => void;
  onExportCSV: (reportType: ReportType) => void;
  isLoading?: boolean;
  isExporting?: boolean;
}

interface ReportOption {
  type: ReportType;
  title: string;
  description: string;
  color: string;
  csvExportType: string;
}

const reportOptions: ReportOption[] = [
  {
    type: 'cost-breakdown-report',
    title: 'Reporte de Desglose de Costos',
    description: 'Ver costos detallados por producto con desglose de base, BOM y adicionales',
    color: designTokens.colors.primary[500],
    csvExportType: 'cost_breakdown',
  },
  {
    type: 'provider-summary-report',
    title: 'Reporte de Resumen por Proveedores',
    description: 'Ver distribución de costos por proveedor con porcentajes y materiales',
    color: designTokens.colors.secondary[500],
    csvExportType: 'provider_summary',
  },
  {
    type: 'detailed-line-items-report',
    title: 'Reporte Detallado de Líneas de Costo',
    description: 'Ver cada componente individual de costo con materiales, servicios y proveedores',
    color: designTokens.colors.info.main,
    csvExportType: 'detailed_line_items',
  },
];

const ReportSelector: React.FC<ReportSelectorProps> = ({
  onViewReport,
  onExportPDF,
  onExportCSV,
  isLoading = false,
  isExporting = false,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {reportOptions.map((option) => (
        <Box
          key={option.type}
          sx={{
            p: 3,
            border: `1px solid ${designTokens.colors.border.light}`,
            borderRadius: designTokens.borderRadius.md,
            '&:hover': {
              backgroundColor: designTokens.colors.primary[50],
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ReportsIcon sx={{ color: option.color, mr: 2 }} />
            <Typography variant="h6" fontWeight="medium">
              {option.title}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {option.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewReport(option.type)}
              disabled={isLoading}
            >
              {isLoading ? 'Generando...' : 'Ver Reporte'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => onExportPDF(option.type)}
              disabled={isExporting}
              color="error"
            >
              {isExporting ? 'Exportando...' : 'Descargar PDF'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => onExportCSV(option.type)}
              disabled={isExporting}
              color="success"
            >
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ReportSelector;
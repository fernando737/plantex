import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import { ReportComponentProps, ProviderSummaryItem } from '../utils/reportTypes';
import { pdfStyles } from '../styles/reportStyles';
import ReportHeader from './ReportHeader';

const ProviderSummaryReport: React.FC<ReportComponentProps> = ({
  data,
  reportType,
  isPrintMode = false
}) => {
  if (!data.providers || data.providers.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        No hay datos disponibles para el reporte de resumen por proveedores.
      </Box>
    );
  }

  const tableStyles = isPrintMode ? pdfStyles.table : {
    width: '100%',
    borderCollapse: 'collapse' as const,
  };

  const headerCellStyles = isPrintMode ? pdfStyles.tableHeader : {
    textAlign: 'left' as const,
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontWeight: 600,
    fontSize: '0.875rem',
    backgroundColor: designTokens.colors.secondary[100],
  };

  const headerCellRightStyles = isPrintMode ? pdfStyles.tableHeaderRight : {
    textAlign: 'right' as const,
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontWeight: 600,
    fontSize: '0.875rem',
    backgroundColor: designTokens.colors.secondary[100],
  };

  const cellStyles = isPrintMode ? pdfStyles.tableCell : {
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontSize: '0.875rem',
  };

  const cellRightStyles = isPrintMode ? pdfStyles.tableCellRight : {
    textAlign: 'right' as const,
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontSize: '0.875rem',
  };

  const cellBoldStyles = isPrintMode ? pdfStyles.tableCellBold : {
    textAlign: 'right' as const,
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontSize: '0.875rem',
    fontWeight: 600,
  };

  const percentageStyles = isPrintMode ? {
    ...pdfStyles.tableCellBold,
    color: '#1976d2',
  } : {
    textAlign: 'right' as const,
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: designTokens.colors.primary[600],
  };

  const renderMaterials = (materials: string[], isPrint: boolean = false) => {
    if (!materials || materials.length === 0) {
      if (isPrint) {
        return <span style={{ fontSize: '10px', color: '#999' }}>Sin materiales</span>;
      }
      return (
        <Typography variant="body2" color="text.disabled">
          Sin materiales
        </Typography>
      );
    }

    if (isPrint) {
      return (
        <div style={{ fontSize: '10px' }}>
          {materials.slice(0, 3).map((material, idx) => (
            <span key={idx} style={pdfStyles.chip}>
              {material}
            </span>
          ))}
          {materials.length > 3 && (
            <span style={{ fontSize: '9px', color: '#666' }}>
              +{materials.length - 3} más
            </span>
          )}
        </div>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {materials.slice(0, 2).map((material: string, materialIndex: number) => (
          <Chip
            key={materialIndex}
            label={material}
            size="small"
            variant="filled"
            sx={{
              fontSize: '0.75rem',
              height: '20px',
              backgroundColor: designTokens.colors.secondary[100],
              color: designTokens.colors.secondary[700],
            }}
          />
        ))}
        {materials.length > 2 && (
          <Chip
            label={`+${materials.length - 2} más`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              height: '20px',
            }}
          />
        )}
      </Box>
    );
  };

  if (isPrintMode) {
    return (
      <div style={pdfStyles.container}>
        <ReportHeader 
          budget={data.budget} 
          reportType={reportType} 
          isPrintMode={true}
        />

        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={headerCellStyles}>Proveedor</th>
              <th style={headerCellStyles}>Tipo</th>
              <th style={headerCellRightStyles}>Costo Total</th>
              <th style={headerCellRightStyles}>Porcentaje</th>
              <th style={headerCellStyles}>Materiales</th>
            </tr>
          </thead>
          <tbody>
            {data.providers.map((provider: ProviderSummaryItem, index: number) => (
              <tr key={index}>
                <td style={cellStyles}>{provider.provider_name}</td>
                <td style={cellStyles}>
                  <span style={pdfStyles.chipSecondary}>
                    {provider.provider_type}
                  </span>
                </td>
                <td style={cellBoldStyles}>{formatCOP(provider.total_cost)}</td>
                <td style={percentageStyles}>{provider.percentage}%</td>
                <td style={cellStyles}>
                  {renderMaterials(provider.materials, true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={pdfStyles.footer}>
          <div>Reporte generado por PlantEx - Sistema de Gestión Textil</div>
        </div>
      </div>
    );
  }

  return (
    <Box>
      <ReportHeader 
        budget={data.budget} 
        reportType={reportType} 
        isPrintMode={false}
      />

      <Box sx={{ overflowX: 'auto' }}>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={headerCellStyles}>Proveedor</th>
              <th style={headerCellStyles}>Tipo</th>
              <th style={headerCellRightStyles}>Costo Total</th>
              <th style={headerCellRightStyles}>Porcentaje</th>
              <th style={headerCellStyles}>Materiales</th>
            </tr>
          </thead>
          <tbody>
            {data.providers.map((provider: ProviderSummaryItem, index: number) => (
              <tr key={index}>
                <td style={cellStyles}>{provider.provider_name}</td>
                <td style={cellStyles}>
                  <Chip
                    label={provider.provider_type}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </td>
                <td style={cellBoldStyles}>{formatCOP(provider.total_cost)}</td>
                <td style={percentageStyles}>{provider.percentage}%</td>
                <td style={cellStyles}>
                  {renderMaterials(provider.materials, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default ProviderSummaryReport;
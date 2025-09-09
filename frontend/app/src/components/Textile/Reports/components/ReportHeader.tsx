import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import { BudgetSummary, ReportType } from '../utils/reportTypes';

interface ReportHeaderProps {
  budget: BudgetSummary;
  reportType: ReportType;
  isPrintMode?: boolean;
}

const getReportTitle = (reportType: ReportType): string => {
  switch (reportType) {
    case 'cost-breakdown-report':
      return 'Desglose de Costos';
    case 'provider-summary-report':
      return 'Resumen por Proveedores';
    case 'detailed-line-items-report':
      return 'Líneas de Costo Detalladas';
    default:
      return 'Reporte';
  }
};

const ReportHeader: React.FC<ReportHeaderProps> = ({
  budget,
  reportType,
  isPrintMode = false
}) => {
  const containerStyles = isPrintMode ? {
    padding: '20px 0',
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #333333',
    marginBottom: '20px'
  } : {
    mb: 3,
    p: 2,
    backgroundColor: designTokens.colors.primary[50],
    borderRadius: designTokens.borderRadius.sm
  };

  const titleStyles = isPrintMode ? {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '8px'
  } : {
    variant: "h6" as const,
    fontWeight: "semibold",
    sx: { mb: 1 }
  };

  const subtitleStyles = isPrintMode ? {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '5px'
  } : {
    variant: "subtitle1" as const,
    fontWeight: "medium",
    sx: { mb: 0.5 }
  };

  const detailsStyles = isPrintMode ? {
    fontSize: '12px',
    color: '#666666'
  } : {
    variant: "body2" as const,
    color: "text.secondary"
  };

  if (isPrintMode) {
    return (
      <div style={containerStyles}>
        <div style={titleStyles}>
          {getReportTitle(reportType)}
        </div>
        <div style={subtitleStyles}>
          {budget.name}
        </div>
        <div style={detailsStyles}>
          {budget.status && `Estado: ${budget.status} | `}
          Total: {formatCOP(budget.total_budget_cop)}
        </div>
        <div style={{ fontSize: '10px', color: '#999999', marginTop: '10px' }}>
          Generado el: {new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  }

  return (
    <Box sx={containerStyles}>
      <Typography {...titleStyles}>
        {getReportTitle(reportType)}
      </Typography>
      <Typography {...subtitleStyles}>
        {budget.name}
      </Typography>
      <Typography {...detailsStyles}>
        {budget.status && `Estado: ${budget.status} | `}
        Total: {formatCOP(budget.total_budget_cop)}
      </Typography>
    </Box>
  );
};

export default ReportHeader;
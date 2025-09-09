import React from 'react';
import { Box } from '@mui/material';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import { ReportComponentProps, CostBreakdownItem } from '../utils/reportTypes';
import { pdfStyles } from '../styles/reportStyles';
import ReportHeader from './ReportHeader';

const CostBreakdownReport: React.FC<ReportComponentProps> = ({
  data,
  reportType,
  isPrintMode = false
}) => {
  if (!data.items || data.items.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        No hay datos disponibles para el reporte de desglose de costos.
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
    backgroundColor: designTokens.colors.primary[50],
  };

  const headerCellRightStyles = isPrintMode ? pdfStyles.tableHeaderRight : {
    textAlign: 'right' as const,
    padding: '12px 8px',
    borderBottom: `1px solid ${designTokens.colors.border.light}`,
    fontWeight: 600,
    fontSize: '0.875rem',
    backgroundColor: designTokens.colors.primary[50],
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
              <th style={headerCellStyles}>Producto</th>
              <th style={headerCellRightStyles}>Cantidad</th>
              <th style={headerCellRightStyles}>Costo Unitario</th>
              <th style={headerCellRightStyles}>Costo Total</th>
              <th style={headerCellRightStyles}>Base</th>
              <th style={headerCellRightStyles}>BOM</th>
              <th style={headerCellRightStyles}>Adicionales</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: CostBreakdownItem, index: number) => (
              <tr key={index}>
                <td style={cellStyles}>{item.product_name}</td>
                <td style={cellRightStyles}>{item.planned_quantity}</td>
                <td style={cellRightStyles}>{formatCOP(item.unit_cost_cop)}</td>
                <td style={cellBoldStyles}>{formatCOP(item.total_cost_cop)}</td>
                <td style={cellRightStyles}>{formatCOP(item.base_cost_cop)}</td>
                <td style={cellRightStyles}>{formatCOP(item.bom_cost_cop)}</td>
                <td style={cellRightStyles}>{formatCOP(item.additional_costs_cop)}</td>
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
              <th style={headerCellStyles}>Producto</th>
              <th style={headerCellRightStyles}>Cantidad</th>
              <th style={headerCellRightStyles}>Costo Unitario</th>
              <th style={headerCellRightStyles}>Costo Total</th>
              <th style={headerCellRightStyles}>Base</th>
              <th style={headerCellRightStyles}>BOM</th>
              <th style={headerCellRightStyles}>Adicionales</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: CostBreakdownItem, index: number) => (
              <tr key={index}>
                <td style={cellStyles}>{item.product_name}</td>
                <td style={cellRightStyles}>{item.planned_quantity}</td>
                <td style={cellRightStyles}>{formatCOP(item.unit_cost_cop)}</td>
                <td style={cellBoldStyles}>{formatCOP(item.total_cost_cop)}</td>
                <td style={cellRightStyles}>{formatCOP(item.base_cost_cop)}</td>
                <td style={cellRightStyles}>{formatCOP(item.bom_cost_cop)}</td>
                <td style={cellRightStyles}>{formatCOP(item.additional_costs_cop)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default CostBreakdownReport;
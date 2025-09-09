import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { formatCOP } from '@/utils/currency';
import { designTokens } from '@/config';
import { ReportComponentProps, DetailedLineItem, BOMItem, AdditionalCost } from '../utils/reportTypes';
import { pdfStyles } from '../styles/reportStyles';
import ReportHeader from './ReportHeader';

const DetailedLineItemsReport: React.FC<ReportComponentProps> = ({
  data,
  reportType,
  isPrintMode = false
}) => {
  if (!data.products || data.products.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        No hay datos disponibles para el reporte de líneas de costo detalladas.
      </Box>
    );
  }

  const renderBOMItemsTable = (bomItems: BOMItem[], isPrint: boolean = false) => {
    if (!bomItems || bomItems.length === 0) return null;

    const tableStyles = isPrint ? pdfStyles.bomTable : {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '16px',
    };

    const headerStyles = isPrint ? pdfStyles.bomHeader : {
      textAlign: 'left' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: designTokens.colors.primary[50],
    };

    const headerRightStyles = isPrint ? { ...pdfStyles.bomHeader, textAlign: 'right' as const } : {
      textAlign: 'right' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: designTokens.colors.primary[50],
    };

    const cellStyles = isPrint ? pdfStyles.bomCell : {
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontSize: '0.75rem',
    };

    const cellRightStyles = isPrint ? { ...pdfStyles.bomCell, textAlign: 'right' as const } : {
      textAlign: 'right' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontSize: '0.75rem',
    };

    const cellBoldStyles = isPrint ? { ...pdfStyles.bomCell, textAlign: 'right' as const, fontWeight: 'bold' } : {
      textAlign: 'right' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontSize: '0.75rem',
      fontWeight: 600,
    };

    return (
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={headerStyles}>Material/Servicio</th>
            <th style={headerStyles}>Tipo</th>
            <th style={headerRightStyles}>Cantidad</th>
            <th style={headerStyles}>Proveedor</th>
            <th style={headerRightStyles}>Precio Unitario</th>
            <th style={headerRightStyles}>Costo Línea</th>
            <th style={headerRightStyles}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bomItems.map((item: BOMItem, itemIndex: number) => (
            <tr key={itemIndex}>
              <td style={cellStyles}>{item.input_name}</td>
              <td style={cellStyles}>
                {isPrint ? (
                  <span style={item.input_type === 'Materia Prima' ? pdfStyles.chipPrimary : pdfStyles.chipSecondary}>
                    {item.input_type}
                  </span>
                ) : (
                  <Chip
                    label={item.input_type}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      height: '18px',
                      color: item.input_type === 'Materia Prima'
                        ? designTokens.colors.primary[600]
                        : designTokens.colors.secondary[600],
                    }}
                  />
                )}
              </td>
              <td style={cellRightStyles}>
                {parseFloat(item.quantity).toString()} {item.unit}
              </td>
              <td style={cellStyles}>{item.provider_name}</td>
              <td style={cellRightStyles}>{formatCOP(item.unit_price_cop)}</td>
              <td style={cellRightStyles}>{formatCOP(item.line_cost_cop)}</td>
              <td style={cellBoldStyles}>{formatCOP(item.total_for_quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderAdditionalCostsTable = (additionalCosts: AdditionalCost[], isPrint: boolean = false) => {
    if (!additionalCosts || additionalCosts.length === 0) return null;

    const tableStyles = isPrint ? pdfStyles.additionalCostsTable : {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '16px',
    };

    const headerStyles = isPrint ? pdfStyles.additionalCostsHeader : {
      textAlign: 'left' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: designTokens.colors.warning[100],
    };

    const headerRightStyles = isPrint ? { ...pdfStyles.additionalCostsHeader, textAlign: 'right' as const } : {
      textAlign: 'right' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: designTokens.colors.warning[100],
    };

    const cellStyles = isPrint ? pdfStyles.tableCell : {
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontSize: '0.75rem',
    };

    const cellRightStyles = isPrint ? pdfStyles.tableCellRight : {
      textAlign: 'right' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontSize: '0.75rem',
    };

    const cellBoldStyles = isPrint ? pdfStyles.tableCellBold : {
      textAlign: 'right' as const,
      padding: '8px',
      borderBottom: `1px solid ${designTokens.colors.border.light}`,
      fontSize: '0.75rem',
      fontWeight: 600,
    };

    return (
      <table style={tableStyles}>
        <thead>
          <tr>
            <th style={headerStyles}>Concepto</th>
            <th style={headerRightStyles}>Costo Unitario</th>
            <th style={headerRightStyles}>Total</th>
          </tr>
        </thead>
        <tbody>
          {additionalCosts.map((cost: AdditionalCost, costIndex: number) => (
            <tr key={costIndex}>
              <td style={cellStyles}>{cost.name}</td>
              <td style={cellRightStyles}>{formatCOP(cost.unit_cost_cop)}</td>
              <td style={cellBoldStyles}>{formatCOP(cost.total_for_quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderProductTotals = (product: DetailedLineItem, isPrint: boolean = false) => {
    if (!product.totals) return null;

    if (isPrint) {
      return (
        <div style={pdfStyles.totalsSummary}>
          <div style={pdfStyles.totalsSummaryTitle}>Resumen de Totales</div>
          <div style={pdfStyles.totalsGrid}>
            <div style={pdfStyles.totalItem}>
              Base: <strong>{formatCOP(product.totals.base_total)}</strong>
            </div>
            <div style={pdfStyles.totalItem}>
              BOM: <strong>{formatCOP(product.totals.bom_total)}</strong>
            </div>
            <div style={pdfStyles.totalItem}>
              Adicionales: <strong>{formatCOP(product.totals.additional_total)}</strong>
            </div>
            <div style={{...pdfStyles.totalItem, color: '#2e7d32'}}>
              Total: <strong>{formatCOP(product.totals.product_total)}</strong>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Box sx={{
        p: 2,
        backgroundColor: designTokens.colors.success[50],
        borderRadius: designTokens.borderRadius.sm,
        border: `1px solid ${designTokens.colors.success[200]}`,
      }}>
        <Typography variant="body2" fontWeight="semibold" sx={{ mb: 1 }}>
          Resumen de Totales
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1 }}>
          <Typography variant="body2">
            Base: <strong>{formatCOP(product.totals.base_total)}</strong>
          </Typography>
          <Typography variant="body2">
            BOM: <strong>{formatCOP(product.totals.bom_total)}</strong>
          </Typography>
          <Typography variant="body2">
            Adicionales: <strong>{formatCOP(product.totals.additional_total)}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: designTokens.colors.success[700] }}>
            Total: <strong>{formatCOP(product.totals.product_total)}</strong>
          </Typography>
        </Box>
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

        {data.products.map((product: DetailedLineItem, productIndex: number) => (
          <div key={productIndex} style={pdfStyles.productSection}>
            <div style={pdfStyles.productHeader}>
              <div style={pdfStyles.productName}>{product.product_name}</div>
              <div style={pdfStyles.productDetails}>
                Cantidad: {product.planned_quantity} | Base: {formatCOP(product.base_cost_cop)} | 
                Total Producto: {formatCOP(product.totals?.product_total)} | 
                Costo Unitario: {formatCOP(product.totals?.unit_cost)}
              </div>
            </div>

            {product.bom_items && product.bom_items.length > 0 && (
              <div>
                <div style={pdfStyles.sectionHeader}>Materiales y Servicios BOM</div>
                {renderBOMItemsTable(product.bom_items, true)}
              </div>
            )}

            {product.additional_costs && product.additional_costs.length > 0 && (
              <div>
                <div style={pdfStyles.sectionHeader}>Costos Adicionales</div>
                {renderAdditionalCostsTable(product.additional_costs, true)}
              </div>
            )}

            {renderProductTotals(product, true)}
          </div>
        ))}

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
        {data.products.map((product: DetailedLineItem, productIndex: number) => (
          <Box key={productIndex} sx={{ mb: 4 }}>
            <Box sx={{
              mb: 2,
              p: 2,
              backgroundColor: designTokens.colors.secondary[50],
              borderRadius: designTokens.borderRadius.sm,
              border: `1px solid ${designTokens.colors.border.light}`,
            }}>
              <Typography variant="h6" fontWeight="semibold">
                {product.product_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cantidad: {product.planned_quantity} | Base: {formatCOP(product.base_cost_cop)} | 
                Total Producto: {formatCOP(product.totals?.product_total)} | 
                Costo Unitario: {formatCOP(product.totals?.unit_cost)}
              </Typography>
            </Box>

            {product.bom_items && product.bom_items.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="semibold" sx={{ mb: 1 }}>
                  Materiales y Servicios BOM
                </Typography>
                {renderBOMItemsTable(product.bom_items, false)}
              </Box>
            )}

            {product.additional_costs && product.additional_costs.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="semibold" sx={{ mb: 1 }}>
                  Costos Adicionales
                </Typography>
                {renderAdditionalCostsTable(product.additional_costs, false)}
              </Box>
            )}

            {renderProductTotals(product, false)}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DetailedLineItemsReport;
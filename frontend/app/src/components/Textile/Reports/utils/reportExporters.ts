import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportData, ReportType, PDFOptions, ExportOptions } from './reportTypes';
import { pdfConfig } from '../styles/reportStyles';

// Core PDF generation function with multi-page support
export const generateReportPDF = async (
  elementId: string,
  filename: string,
  options: Partial<PDFOptions> = {}
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Merge with default options
    const pdfOptions = { ...pdfConfig.defaultOptions, ...options };
    const canvasOptions = { 
      ...pdfConfig.canvasOptions,
      scale: 1.5, // Reduce scale for better performance but maintain quality
      height: element.scrollHeight,
      width: element.scrollWidth
    };

    // Generate canvas from HTML element
    const canvas = await html2canvas(element, canvasOptions);
    
    // Calculate dimensions
    const imgData = canvas.toDataURL('image/png', pdfOptions.quality);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // PDF page dimensions in mm
    const pageWidth = pdfOptions.orientation === 'landscape' ? 297 : 210;
    const pageHeight = pdfOptions.orientation === 'landscape' ? 210 : 297;
    
    // Calculate available space
    const availableWidth = pageWidth - pdfOptions.margins.left - pdfOptions.margins.right;
    const availableHeight = pageHeight - pdfOptions.margins.top - pdfOptions.margins.bottom;
    
    // Convert pixels to mm (96 DPI standard)
    const pxToMm = 0.264583;
    const contentWidth = imgWidth * pxToMm;
    const contentHeight = imgHeight * pxToMm;
    
    // Calculate scale to fit width
    const widthScale = availableWidth / contentWidth;
    const scaledWidth = availableWidth;
    const scaledHeight = contentHeight * widthScale;

    // Create PDF
    const pdf = new jsPDF({
      orientation: pdfOptions.orientation,
      unit: 'mm',
      format: pdfOptions.pageSize,
    });

    // Check if content fits on one page
    if (scaledHeight <= availableHeight) {
      // Single page - center content vertically
      const yOffset = (availableHeight - scaledHeight) / 2;
      pdf.addImage(
        imgData,
        'PNG',
        pdfOptions.margins.left,
        pdfOptions.margins.top + yOffset,
        scaledWidth,
        scaledHeight,
        undefined,
        'FAST'
      );
    } else {
      // Multi-page handling
      let remainingHeight = scaledHeight;
      let sourceY = 0;
      let pageNumber = 0;
      
      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }
        
        const currentPageHeight = Math.min(availableHeight, remainingHeight);
        const sourceHeight = (currentPageHeight / scaledHeight) * imgHeight;
        
        // Create a canvas for the current page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY, // source x, y
            imgWidth, sourceHeight, // source width, height
            0, 0, // dest x, y
            imgWidth, sourceHeight // dest width, height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', pdfOptions.quality);
          pdf.addImage(
            pageImgData,
            'PNG',
            pdfOptions.margins.left,
            pdfOptions.margins.top,
            scaledWidth,
            currentPageHeight,
            undefined,
            'FAST'
          );
        }
        
        sourceY += sourceHeight;
        remainingHeight -= currentPageHeight;
        pageNumber++;
      }
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Generate filename with timestamp
const generateFilename = (reportType: ReportType, budgetName: string, includeDate: boolean = true): string => {
  const typeMap = {
    'cost-breakdown-report': 'DesgloseCostos',
    'provider-summary-report': 'ResumenProveedores',
    'detailed-line-items-report': 'LineasDetalladas',
  };

  const sanitizedBudgetName = budgetName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const reportTypeName = typeMap[reportType];
  
  if (includeDate) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}T${hours}-${minutes}`;
    return `${reportTypeName}_${sanitizedBudgetName}_${timestamp}.pdf`;
  }
  
  return `${reportTypeName}_${sanitizedBudgetName}.pdf`;
};

// Report-specific PDF generators
export const generateCostBreakdownPDF = async (
  data: ReportData,
  options: ExportOptions = {}
): Promise<void> => {
  const filename = options.filename || generateFilename('cost-breakdown-report', data.budget.name, options.includeDate);
  const pdfOptions = options.pdfOptions || {};
  
  await generateReportPDF('cost-breakdown-report-print', filename, pdfOptions);
};

export const generateProviderSummaryPDF = async (
  data: ReportData,
  options: ExportOptions = {}
): Promise<void> => {
  const filename = options.filename || generateFilename('provider-summary-report', data.budget.name, options.includeDate);
  const pdfOptions = options.pdfOptions || {};
  
  await generateReportPDF('provider-summary-report-print', filename, pdfOptions);
};

export const generateDetailedLineItemsPDF = async (
  data: ReportData,
  options: ExportOptions = {}
): Promise<void> => {
  const filename = options.filename || generateFilename('detailed-line-items-report', data.budget.name, options.includeDate);
  const pdfOptions = options.pdfOptions || {}; // Use default portrait orientation
  
  await generateReportPDF('detailed-line-items-report-print', filename, pdfOptions);
};

// CSV Export functions (existing functionality)
export const generateCostBreakdownCSV = (data: ReportData): string => {
  if (!data.items) return '';
  
  let csvContent = 'Presupuesto,Producto,Cantidad Planificada,Costo Unitario,Costo Total,Costo Base,Costo BOM,Costos Adicionales\n';
  data.items.forEach((item) => {
    csvContent += `"${data.budget.name}","${item.product_name}",${item.planned_quantity},"${item.unit_cost_cop}","${item.total_cost_cop}","${item.base_cost_cop}","${item.bom_cost_cop}","${item.additional_costs_cop}"\n`;
  });
  
  return csvContent;
};

export const generateProviderSummaryCSV = (data: ReportData): string => {
  if (!data.providers) return '';
  
  let csvContent = 'Presupuesto,Proveedor,Tipo de Proveedor,Costo Total,Porcentaje,Materiales\n';
  data.providers.forEach((provider) => {
    const materials = provider.materials.join('; ');
    csvContent += `"${data.budget.name}","${provider.provider_name}","${provider.provider_type}","${provider.total_cost}",${provider.percentage},"${materials}"\n`;
  });
  
  return csvContent;
};

export const generateDetailedLineItemsCSV = (data: ReportData): string => {
  if (!data.products) return '';
  
  let csvContent = 'Presupuesto,Producto,Tipo de Costo,Componente,Proveedor,Cantidad,Unidad,Precio Unitario,Costo Línea,Cant. Producto,Total para Presupuesto\n';
  
  data.products.forEach((product) => {
    // Base cost
    csvContent += `"${data.budget.name}","${product.product_name}","Costo Base","Costo Base","N/A","1","unidad","${product.base_cost_cop}","${product.base_cost_cop}",${product.planned_quantity},"${product.base_cost_total}"\n`;
    
    // BOM items
    product.bom_items?.forEach((item) => {
      csvContent += `"${data.budget.name}","${product.product_name}","BOM","${item.input_name}","${item.provider_name}","${item.quantity}","${item.unit}","${item.unit_price_cop}","${item.line_cost_cop}",${product.planned_quantity},"${item.total_for_quantity}"\n`;
    });
    
    // Additional costs
    product.additional_costs?.forEach((cost) => {
      csvContent += `"${data.budget.name}","${product.product_name}","Adicional","${cost.name}","N/A","1","unidad","${cost.unit_cost_cop}","${cost.unit_cost_cop}",${product.planned_quantity},"${cost.total_for_quantity}"\n`;
    });
  });
  
  return csvContent;
};

// Generic CSV export function
export const exportToCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate CSV filename
const generateCSVFilename = (reportType: ReportType, budgetName: string, includeDate: boolean = true): string => {
  const typeMap = {
    'cost-breakdown-report': 'DesgloseCostos',
    'provider-summary-report': 'ResumenProveedores',
    'detailed-line-items-report': 'LineasDetalladas',
  };

  const sanitizedBudgetName = budgetName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const reportTypeName = typeMap[reportType];
  
  if (includeDate) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}T${hours}-${minutes}`;
    return `${reportTypeName}_${sanitizedBudgetName}_${timestamp}.csv`;
  }
  
  return `${reportTypeName}_${sanitizedBudgetName}.csv`;
};

// Export report as CSV
export const exportReportAsCSV = (
  reportType: ReportType,
  data: ReportData,
  options: ExportOptions = {}
): void => {
  let csvContent = '';
  
  switch (reportType) {
    case 'cost-breakdown-report':
      csvContent = generateCostBreakdownCSV(data);
      break;
    case 'provider-summary-report':
      csvContent = generateProviderSummaryCSV(data);
      break;
    case 'detailed-line-items-report':
      csvContent = generateDetailedLineItemsCSV(data);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
  
  if (!csvContent) {
    throw new Error('No data available for CSV export');
  }
  
  const filename = options.filename || generateCSVFilename(reportType, data.budget.name, options.includeDate);
  exportToCSV(csvContent, filename);
};

// Export report as PDF
export const exportReportAsPDF = async (
  reportType: ReportType,
  data: ReportData,
  options: ExportOptions = {}
): Promise<void> => {
  switch (reportType) {
    case 'cost-breakdown-report':
      await generateCostBreakdownPDF(data, options);
      break;
    case 'provider-summary-report':
      await generateProviderSummaryPDF(data, options);
      break;
    case 'detailed-line-items-report':
      await generateDetailedLineItemsPDF(data, options);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
};
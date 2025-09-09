// PDF-optimized styles for report generation

import { designTokens } from '@/config';

export const pdfStyles = {
  // Main container styles
  container: {
    padding: '20px',
    backgroundColor: '#ffffff',
    minHeight: 'auto',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: '#000000',
  },

  // Header styles
  header: {
    marginBottom: '20px',
    borderBottom: '2px solid #333333',
    paddingBottom: '10px',
  },

  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#000000',
  },

  subtitle: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '10px',
  },

  // Budget summary styles
  budgetSummary: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    marginBottom: '20px',
    border: '1px solid #dddddd',
    borderRadius: '4px',
  },

  budgetName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },

  budgetDetails: {
    fontSize: '12px',
    color: '#666666',
  },

  // Table styles
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '20px',
    pageBreakInside: 'auto', // Allow page breaks within tables for long content
    fontSize: '11px',
    border: '1px solid #cccccc',
  },

  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: '10px 8px',
    borderBottom: '2px solid #333333',
    fontSize: '11px',
    textAlign: 'left' as const,
  },

  tableHeaderRight: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: '10px 8px',
    borderBottom: '2px solid #333333',
    fontSize: '11px',
    textAlign: 'right' as const,
  },

  tableCell: {
    padding: '8px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '11px',
    verticalAlign: 'top' as const,
  },

  tableCellRight: {
    padding: '8px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '11px',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
  },

  tableCellBold: {
    padding: '8px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '11px',
    fontWeight: 'bold',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
  },

  // Product section styles (for detailed line items)
  productSection: {
    marginBottom: '25px',
    pageBreakInside: 'avoid',
  },

  productHeader: {
    backgroundColor: '#e8f4f8',
    padding: '12px',
    border: '1px solid #cccccc',
    marginBottom: '10px',
    borderRadius: '4px',
  },

  productName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },

  productDetails: {
    fontSize: '11px',
    color: '#666666',
  },

  // Section headers
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '8px',
    marginTop: '15px',
  },

  // BOM items table
  bomTable: {
    backgroundColor: '#f8f9ff',
  },

  bomHeader: {
    backgroundColor: '#e3f2fd',
    fontWeight: 'bold',
    padding: '8px',
    borderBottom: '1px solid #bbbbbb',
    fontSize: '10px',
  },

  bomCell: {
    padding: '6px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '10px',
    backgroundColor: '#ffffff',
  },

  // Additional costs table
  additionalCostsTable: {
    backgroundColor: '#fff8f0',
  },

  additionalCostsHeader: {
    backgroundColor: '#fff3e0',
    fontWeight: 'bold',
    padding: '8px',
    borderBottom: '1px solid #bbbbbb',
    fontSize: '10px',
  },

  // Totals summary
  totalsSummary: {
    backgroundColor: '#f0f8f0',
    padding: '12px',
    border: '1px solid #c8e6c9',
    borderRadius: '4px',
    marginTop: '10px',
  },

  totalsSummaryTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },

  totalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px',
  },

  totalItem: {
    fontSize: '11px',
  },

  totalItemStrong: {
    fontWeight: 'bold',
  },

  // Chip/badge styles (for types, materials, etc.)
  chip: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#e0e0e0',
    border: '1px solid #cccccc',
    borderRadius: '3px',
    fontSize: '9px',
    marginRight: '4px',
    marginBottom: '2px',
  },

  chipPrimary: {
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196f3',
    color: '#1565c0',
  },

  chipSecondary: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #9e9e9e',
    color: '#424242',
  },

  // Materials list
  materialsList: {
    fontSize: '10px',
  },

  // Footer
  footer: {
    marginTop: '30px',
    borderTop: '1px solid #cccccc',
    paddingTop: '10px',
    fontSize: '10px',
    color: '#666666',
    textAlign: 'center' as const,
  },

  // Page break utilities
  pageBreak: {
    pageBreakBefore: 'always' as const,
  },

  avoidPageBreak: {
    pageBreakInside: 'avoid' as const,
  },

  // Print-specific media query styles
  '@media print': {
    container: {
      margin: '0',
      padding: '15px',
      boxShadow: 'none',
    },
    table: {
      fontSize: '10px',
    },
    pageBreak: {
      pageBreakBefore: 'always' as const,
    },
  },
} as const;

// Helper function to generate inline styles for PDF
export const getInlineStyles = (styleObject: Record<string, any>): string => {
  return Object.entries(styleObject)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
    .join(';');
};

// PDF generation specific utilities
export const pdfConfig = {
  defaultOptions: {
    orientation: 'portrait' as const,
    margins: {
      top: 20,
      right: 15,
      bottom: 20,
      left: 15,
    },
    pageSize: 'a4' as const,
    quality: 0.95,
  },
  
  landscapeOptions: {
    orientation: 'landscape' as const,
    margins: {
      top: 15,
      right: 20,
      bottom: 15,
      left: 20,
    },
    pageSize: 'a4' as const,
    quality: 0.95,
  },

  // Canvas options for html2canvas
  canvasOptions: {
    scale: 1.5, // Reduced for better performance while maintaining quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    removeContainer: true,
    imageTimeout: 15000,
    width: null, // Auto-detect width
    height: null, // Auto-detect height
    scrollX: 0,
    scrollY: 0,
  },
} as const;
// TypeScript interfaces for the Reports system

export interface BudgetSummary {
  name: string;
  status?: string;
  total_budget_cop: string;
}

export interface CostBreakdownItem {
  product_name: string;
  planned_quantity: number;
  unit_cost_cop: string;
  total_cost_cop: string;
  bom_cost_cop: string;
}

export interface ProviderSummaryItem {
  provider_name: string;
  total_cost: string;
  percentage: number;
  materials: string[];
}

export interface BOMItem {
  input_name: string;
  input_type: string;
  quantity: string;
  unit: string;
  provider_name: string;
  unit_price_cop: string;
  line_cost_cop: string;
  total_for_quantity: string;
}


export interface ProductTotals {
  bom_total: string;
  product_total: string;
  unit_cost: string;
}

export interface DetailedLineItem {
  product_name: string;
  planned_quantity: number;
  bom_items: BOMItem[];
  totals: ProductTotals;
}

export interface ReportData {
  budget: BudgetSummary;
  items?: CostBreakdownItem[];
  providers?: ProviderSummaryItem[];
  products?: DetailedLineItem[];
}

export type ReportType = 'cost-breakdown-report' | 'provider-summary-report' | 'detailed-line-items-report';

export interface PDFOptions {
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize: 'a4' | 'letter';
  quality: number;
}

export interface ExportOptions {
  filename?: string;
  includeDate?: boolean;
  pdfOptions?: Partial<PDFOptions>;
}

export interface ReportModalProps {
  open: boolean;
  budget: any; // ProductionBudget from existing types
  onClose: () => void;
}

export interface ReportComponentProps {
  data: ReportData;
  reportType: ReportType;
  isPrintMode?: boolean;
}

export interface UseReportExportReturn {
  exportToPDF: (reportType: ReportType, data: ReportData, options?: ExportOptions) => Promise<void>;
  exportToCSV: (reportType: ReportType, data: ReportData, options?: ExportOptions) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
}

export interface UseReportDataReturn {
  fetchReport: (budgetId: number, reportType: ReportType) => Promise<ReportData>;
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseReportModalReturn {
  reportData: ReportData | null;
  reportType: ReportType | null;
  isLoading: boolean;
  error: string | null;
  handleViewReport: (reportType: ReportType) => Promise<void>;
  clearReport: () => void;
}
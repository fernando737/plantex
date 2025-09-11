import { useApiGet, useApiPost, useApiPatch, useApiDelete } from '@/hooks/useApi';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Unit, UnitFormData,
  Provider, ProviderFormData,
  Input, InputFormData,
  InputProvider, InputProviderFormData,
  BOMTemplate, BOMTemplateFormData,
  BOMItem, BOMItemFormData,
  EndProduct, EndProductFormData,
  AdditionalCost, AdditionalCostFormData,
  ProductionBudget, ProductionBudgetFormData,
  ProductionBudgetItem, ProductionBudgetItemFormData,
  TextileApiResponse,
  CostRecalculationResponse,
  CSVImportResponse,
  CSVImportOptions,
  CSVExportOptions
} from '@/types/textile';

// Generic CRUD hooks factory using existing useApi hooks
export function createTextileEntityHooks<T, TFormData>(endpoint: string) {
  return {
    // List query
    useList: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return useApiGet<TextileApiResponse<T>>(`/textile/${endpoint}/${queryString}`);
    },

    // Detail query
    useDetail: (id: number) => {
      return useApiGet<T>(`/textile/${endpoint}/${id}/`, { enabled: !!id });
    },

    // Create mutation
    useCreate: () => {
      return useApiPost<T, TFormData>(`/textile/${endpoint}/`);
    },

    // Update mutation
    useUpdate: (id: number) => {
      return useApiPatch<T, Partial<TFormData>>(`/textile/${endpoint}/${id}/`);
    },

    // Delete mutation
    useDelete: (id: number) => {
      return useApiDelete<void>(`/textile/${endpoint}/${id}/`);
    },
  };
}

// Specific entity hooks
export const useUnits = () => createTextileEntityHooks<Unit, UnitFormData>('units');
export const useProviders = () => createTextileEntityHooks<Provider, ProviderFormData>('providers');
export const useInputs = () => createTextileEntityHooks<Input, InputFormData>('inputs');
export const useInputProviders = () => createTextileEntityHooks<InputProvider, InputProviderFormData>('input-providers');
export const useBOMTemplates = () => createTextileEntityHooks<BOMTemplate, BOMTemplateFormData>('bom-templates');
export const useBOMItems = () => createTextileEntityHooks<BOMItem, BOMItemFormData>('bom-items');
export const useEndProducts = () => createTextileEntityHooks<EndProduct, EndProductFormData>('end-products');
export const useAdditionalCosts = () => createTextileEntityHooks<AdditionalCost, AdditionalCostFormData>('additional-costs');
export const useProductionBudgets = () => createTextileEntityHooks<ProductionBudget, ProductionBudgetFormData>('production-budgets');
export const useProductionBudgetItems = () => createTextileEntityHooks<ProductionBudgetItem, ProductionBudgetItemFormData>('production-budget-items');

// Cost recalculation hooks
export const useBOMCostRecalculation = (id?: number) => {
  const endpoint = id ? `/textile/bom-templates/${id}/recalculate-cost/` : '/textile/bom-templates/recalculate-all-costs/';
  return useApiPost<CostRecalculationResponse, {}>(endpoint);
};


export const useProductionBudgetCostRecalculation = (id?: number) => {
  const endpoint = id ? `/textile/production-budgets/${id}/recalculate-cost/` : '/textile/production-budgets/recalculate-all-costs/';
  return useApiPost<CostRecalculationResponse, {}>(endpoint);
};

// Report hooks
export const useProductionBudgetReports = (id: number) => {
  return {
    // Reporte de Desglose de Costos
    useReporteDesgloseCotos: () => {
      return useApiGet<any>(`/textile/production-budgets/${id}/reporte_desglose_costos/`, { enabled: !!id });
    },

    // Reporte de Resumen por Proveedores  
    useReporteResumenProveedores: () => {
      return useApiGet<any>(`/textile/production-budgets/${id}/reporte_resumen_proveedores/`, { enabled: !!id });
    },

    // Reporte Detallado de Líneas de Costo
    useReporteDetalleLineasCosto: () => {
      return useApiGet<any>(`/textile/production-budgets/${id}/reporte_detalle_lineas_costo/`, { enabled: !!id });
    },

    // Exportar Reporte
    useExportarReporte: () => {
      return useApiGet<any>(`/textile/production-budgets/${id}/exportar_reporte/`);
    }
  };
};

// CSV Import/Export hooks for Providers
export const useProviderCSVOperations = () => {
  
  // CSV Import hook
  const useImportCSV = () => {
    return useMutation({
      mutationFn: async ({ file, options = {} }: { file: File; options?: CSVImportOptions }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add options as form fields
        if (options.validate_only !== undefined) {
          formData.append('validate_only', options.validate_only.toString());
        }
        if (options.skip_duplicates !== undefined) {
          formData.append('skip_duplicates', options.skip_duplicates.toString());
        }
        if (options.continue_on_error !== undefined) {
          formData.append('continue_on_error', options.continue_on_error.toString());
        }

        const response = await axios.post<CSVImportResponse>(
          `/api/textile/providers/import-csv/`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        return response.data;
      },
    });
  };

  // CSV Export hook
  const useExportCSV = () => {
    return useMutation({
      mutationFn: async (options: CSVExportOptions = {}) => {
        const params = new URLSearchParams();
        
        if (options.created_after) params.append('created_after', options.created_after);
        if (options.created_before) params.append('created_before', options.created_before);
        if (options.name_contains) params.append('name_contains', options.name_contains);
        if (options.has_email !== undefined) params.append('has_email', options.has_email.toString());

        const queryString = params.toString();
        const url = `/api/textile/providers/export-csv/${queryString ? '?' + queryString : ''}`;
        
        const response = await axios.get(url, {
          responseType: 'blob',
        });
        
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'proveedores.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return response.data;
      },
    });
  };

  // CSV Template download hook
  const useDownloadTemplate = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await axios.get('/api/textile/providers/csv-template/', {
          responseType: 'blob',
        });
        
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'plantilla_proveedores.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return response.data;
      },
    });
  };

  return {
    useImportCSV,
    useExportCSV,
    useDownloadTemplate,
  };
};
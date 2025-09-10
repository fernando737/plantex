import { useApiGet, useApiPost, useApiPatch, useApiDelete } from '@/hooks/useApi';
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
  CostRecalculationResponse
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
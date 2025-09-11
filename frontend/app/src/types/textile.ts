export interface Unit {
  id: number;
  name_en: string;
  name_es: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Input {
  id: number;
  name: string;
  description?: string;
  input_type: 'confection' | 'supply' | 'fabric' | 'process';
  unit: number;
  created_at: string;
  updated_at: string;
}

export interface InputProvider {
  id: number;
  input: number;
  provider: number;
  price_per_unit_cop: string;
  is_preferred: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BOMTemplate {
  id: number;
  name: string;
  description?: string;
  total_cost_cop: string;
  created_at: string;
  updated_at: string;
}

export interface BOMItem {
  id: number;
  bom_template: number;
  input: number;
  input_provider: number;
  quantity: string;
  line_cost_cop: string;
  created_at: string;
  updated_at: string;
}

export interface EndProduct {
  id: number;
  name: string;
  description?: string;
  bom_template?: number;
  bom_cost_cop: string;
  total_cost_cop: string;
  produced_quantity: number;
  created_at: string;
  updated_at: string;
}


export interface ProductionBudget {
  id: number;
  name: string;
  description?: string;
  total_budget_cop: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProductionBudgetItem {
  id: number;
  production_budget: number;
  end_product: number;
  planned_quantity: number;
  unit_cost_cop: string;
  total_cost_cop: string;
  created_at: string;
  updated_at: string;
}

// Extended interfaces with populated relationships for display
export interface InputWithUnit extends Input {
  unit_data: Unit;
}

export interface InputProviderWithRelations extends InputProvider {
  input_data: Input;
  provider_data: Provider;
}

export interface BOMItemWithRelations extends BOMItem {
  input_data: InputWithUnit;
}

export interface BOMTemplateWithItems extends BOMTemplate {
  items: BOMItemWithRelations[];
}

export interface EndProductWithRelations extends EndProduct {
  bom_template_data?: BOMTemplate;
}

export interface ProductionBudgetItemWithRelations extends ProductionBudgetItem {
  end_product_data: EndProduct;
}

export interface ProductionBudgetWithItems extends ProductionBudget {
  items: ProductionBudgetItemWithRelations[];
}

// Form interfaces for creating/editing
export interface UnitFormData {
  name_en: string;
  name_es: string;
  abbreviation: string;
}

export interface ProviderFormData {
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  notes?: string;
}

export interface InputFormData {
  name: string;
  description?: string;
  input_type: 'confection' | 'supply' | 'fabric' | 'process';
  unit: number;
}

export interface InputProviderFormData {
  input: number;
  provider: number;
  price_per_unit_cop: string;
  is_preferred?: boolean;
  notes?: string;
}

export interface BOMTemplateFormData {
  name: string;
  description?: string;
}

export interface BOMItemFormData {
  bom_template: number;
  input: number;
  input_provider: number;
  quantity: string;
}

export interface EndProductFormData {
  name: string;
  description?: string;
  bom_template?: number;
}


export interface ProductionBudgetFormData {
  name: string;
  description?: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
}

export interface ProductionBudgetItemFormData {
  production_budget: number;
  end_product: number;
  planned_quantity: number;
  cost_per_unit: string;
}

// API Response interfaces
export interface TextileApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface CostRecalculationResponse {
  message: string;
  updated_count: number;
  total_cost: string;
}

// CSV Import/Export types
export interface CSVImportResponse {
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: string[];
  validate_only: boolean;
}

export interface CSVImportOptions {
  validate_only?: boolean;
  skip_duplicates?: boolean;
  continue_on_error?: boolean;
}

export interface CSVExportOptions {
  created_after?: string;
  created_before?: string;
  name_contains?: string;
  has_email?: boolean;
}
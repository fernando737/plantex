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
  provider_type: 'supplier' | 'workshop' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Input {
  id: number;
  name: string;
  description?: string;
  input_type: 'raw_material' | 'service';
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
  base_cost_cop: string;
  bom_cost_cop: string;
  additional_costs_cop: string;
  total_cost_cop: string;
  produced_quantity: number;
  created_at: string;
  updated_at: string;
  // From detail serializer
  additional_cost_count?: number;
  additional_costs_data?: {
    id: number;
    name: string;
    value_cop: string;
    isNew?: boolean;
  }[];
}

export interface AdditionalCost {
  id: number;
  end_product: number;
  name: string;
  cost: string;
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
  additional_costs: AdditionalCost[];
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
  provider_type: 'supplier' | 'workshop' | 'other';
  notes?: string;
}

export interface InputFormData {
  name: string;
  description?: string;
  input_type: 'raw_material' | 'service';
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
  base_cost_cop: string;
  additional_costs?: {
    id?: number;
    name: string;
    value_cop: string;
    isNew?: boolean;
  }[];
}

export interface AdditionalCostFormData {
  end_product: number;
  name: string;
  cost: string;
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
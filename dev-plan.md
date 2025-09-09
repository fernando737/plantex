# Textile Production Planning System - Development Plan

## Overview
Extend existing Django + React multi-tenant template to build a textile production planning system using the current tech stack.

## Current Technology Stack

### Backend
- Django 4.2 + Django REST Framework
- PostgreSQL with django-tenants (multi-tenancy)
- JWT Authentication with refresh tokens
- drf-spectacular (Swagger/OpenAPI docs)

### Frontend
- React 18 + TypeScript
- Zustand (client state management)
- TanStack Query (server state management)
- Material-UI + Emotion (UI components)
- Axios with interceptors (HTTP client)
- Vite (build tool)

## Backend Development Plan (Django)

### Phase 1: Core Models Setup
- [ ] **Unit Management**
  - Add Unit model to core/models.py
  - Create initial data migration with basic units (un, m, kg)
  - Add Unit admin interface

- [ ] **Provider Management**
  - Add Provider model with multi-type support (Proveedor, Taller, Otro)
  - Add Provider admin interface with filtering by type

- [ ] **Input Management**
  - Add Input model (Raw Materials & Services)
  - Add InputProvider junction model for multiple providers with different prices
  - Add admin interfaces with proper relationships

### Phase 2: BOM System
- [ ] **BOM Templates**
  - Add BOMTemplate and BOMItem models
  - Implement cached cost calculations (total_cost_cop field)
  - Add admin interface for BOM management
  - Create BOM cost calculation signals/methods

- [ ] **End Products**
  - Add EndProduct model with BOM association
  - Add AdditionalCost model for custom line items
  - Implement cached cost fields (bom_cost_cop, additional_costs_cop, total_cost_cop)
  - Add simple inventory tracking (produced_quantity field)

### Phase 3: Production Budget System
- [ ] **Budget Management**
  - Add ProductionBudget model with status tracking (Borrador, Aprobado, En Progreso, Completado)
  - Add ProductionBudgetItem model for product quantities
  - Implement cached budget calculations
  - Add status workflow management

### Phase 4: REST API Development
- [ ] **ViewSets & Serializers**
  - Create ViewSets for all models using DRF
  - Implement proper serializers with nested relationships
  - Add filtering, searching, and pagination
  - Custom endpoints for cost calculations

- [ ] **Cost Calculation Logic**
  - Create service layer for cost calculations
  - Implement automatic cost updates via Django signals
  - Add management commands for batch cost recalculation

## Frontend Development Plan (React + TypeScript)

### Phase 1: Core Infrastructure
- [ ] **TypeScript Interfaces**
  ```typescript
  interface Unit {
    id: number;
    name_en: string;
    name_es: string;
    abbreviation: string;
  }
  
  interface Provider {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    provider_type: 'supplier' | 'workshop' | 'other';
  }
  
  interface Input {
    id: number;
    name: string;
    input_type: 'raw_material' | 'service';
    unit: Unit;
    input_providers: InputProvider[];
  }
  
  interface InputProvider {
    id: number;
    input: number;
    provider: Provider;
    price_per_unit_cop: number;
    is_preferred: boolean;
  }
  // ... more interfaces
  ```

- [ ] **Zustand Stores Setup**
  ```typescript
  // stores/textileStore.ts
  interface TextileStore {
    units: Unit[];
    providers: Provider[];
    inputs: Input[];
    bomTemplates: BOMTemplate[];
    endProducts: EndProduct[];
    productionBudgets: ProductionBudget[];
    // actions
    setUnits: (units: Unit[]) => void;
    // ... more actions
  }
  ```

### Phase 2: API Integration with TanStack Query
- [ ] **Custom Hooks for Textile Entities**
  ```typescript
  // hooks/useTextile.ts
  export const useUnits = () => useApiGet<Unit[]>('/units/');
  export const useProviders = () => useApiGet<Provider[]>('/providers/');
  export const useCreateProvider = () => useApiPost<Provider>('/providers/');
  // ... more hooks following existing pattern
  ```

- [ ] **Query Keys Management**
  - Organize query keys for efficient cache invalidation
  - Implement optimistic updates where appropriate

### Phase 3: Core Management Views
- [ ] **Provider Management**
  - Provider list view with MUI DataGrid
  - Provider create/edit forms with MUI components
  - Provider-Input relationship display
  - Filtering by provider type

- [ ] **Input Management**
  - Input list view with provider pricing display
  - Input create/edit forms with provider selection
  - Multi-provider pricing management interface
  - Input type filtering (Raw Material vs Service)

### Phase 4: BOM Management
- [ ] **BOM Templates**
  - BOM template list and detail views
  - BOM template builder interface (drag & drop or form-based)
  - Real-time cost calculation display
  - Template duplication functionality

- [ ] **End Product Management**
  - End product list with cost breakdown
  - Product create/edit forms with BOM selection
  - Additional costs management (add/edit/remove custom costs)
  - Simple inventory display and editing (produced_quantity)

### Phase 5: Production Budget System
- [ ] **Budget Management**
  - Production budget list with status filtering
  - Budget builder interface (multi-product selection with quantities)
  - Budget summary with detailed cost breakdowns
  - Status management workflow with proper transitions

- [ ] **Reporting & Analytics**
  - Cost breakdown reports by product
  - Provider cost analysis views
  - Budget summary exports (CSV format initially)
  - Simple charts using MUI components or Chart.js

### Phase 6: UI/UX Polish
- [ ] **Material-UI Components**
  - Consistent theme usage following existing patterns
  - Form validation with proper error handling
  - Loading states and progress indicators
  - Responsive design for mobile/tablet

- [ ] **User Experience Enhancements**
  - Search and filtering capabilities on all lists
  - Pagination for large datasets
  - Bulk operations where appropriate
  - Toast notifications for actions (following existing pattern)

## Technical Implementation Details

### Database Schema (COP Currency)
```sql
-- All cost fields store Colombian Pesos as DECIMAL(12,2)
-- Cached calculations for performance
-- Multi-provider pricing through InputProvider junction table
```

### API Endpoints Structure
```
/api/units/                    # CRUD for units
/api/providers/               # CRUD for providers
/api/inputs/                  # CRUD for inputs
/api/input-providers/         # CRUD for input-provider relationships
/api/bom-templates/           # CRUD for BOM templates
/api/bom-items/              # CRUD for BOM items
/api/end-products/           # CRUD for end products
/api/additional-costs/       # CRUD for additional costs
/api/production-budgets/     # CRUD for production budgets
/api/production-budget-items/ # CRUD for budget items

# Custom endpoints for calculations
/api/bom-templates/{id}/calculate-cost/
/api/end-products/{id}/calculate-cost/
/api/production-budgets/{id}/calculate-total/
```

### Frontend Architecture
- **State Management**: Zustand for client state, TanStack Query for server state
- **Component Structure**: Follow existing patterns in the project
- **Forms**: Add React Hook Form + Yup for validation
- **HTTP**: Extend existing useApi hooks pattern
- **Routing**: Integrate with existing React Router setup

## Cost Calculation Logic
1. **Input Costs**: Multiple providers per input with different prices
2. **BOM Costs**: Sum of (input_quantity × selected_provider_price) for all BOM items
3. **Product Costs**: BOM cost + additional custom costs
4. **Budget Costs**: Sum of (product_cost × planned_quantity) for all budget items

## Data Flow
```
Provider → InputProvider (prices) → BOMItem → BOMTemplate → EndProduct → ProductionBudgetItem → ProductionBudget
```

## Integration Points
- **Authentication**: Use existing JWT auth system
- **Multi-tenancy**: All textile data isolated per tenant
- **Admin Interface**: Extend existing Django admin with textile models
- **API Documentation**: Auto-generated Swagger docs via drf-spectacular

## Finalized Implementation Details

### Menu Structure Integration
Navigation order in existing menu system:
1. **Gestión de Proveedores** (Provider Management)
2. **Gestión de Insumos** (Input Management) 
3. **Plantillas BOM** (BOM Templates)
4. **Productos Finales** (End Products)
5. **Presupuestos de Producción** (Production Budgets)

### Initial Data Setup
**Initial Units Migration:**
- Unidades (un) - Units
- Metros (m) - Meters  
- Kilogramos (kg) - Kilograms

### Admin Interface Configuration
- All textile models available in Django Admin
- No specific admin-only features required
- Standard Django admin capabilities

### Permissions & Access Control
- No role-based permissions needed
- All authenticated users within tenant have full access
- Multi-tenant isolation maintained automatically

### Cost Calculation Strategy
**Manual Recalculation Only:**
- No automatic triggers to prevent system overload
- Manual recalculation via management command or API endpoint
- Simple synchronous processing (no background tasks)

**Cost Calculation Flow:**
```
Manual Trigger → BOMItem cost → BOMTemplate total → EndProduct cost → ProductionBudget total
```

**Implementation Approach:**
- No Django signals for cost updates
- Manual `save()` method overrides when needed
- Synchronous cost calculation methods
- User-initiated recalculation buttons in UI

### Frontend URL Structure
```
/textile/providers          # Provider management
/textile/inputs             # Input management  
/textile/bom-templates      # BOM template management
/textile/products           # End product management
/textile/budgets            # Production budget management
```

### Production Budget Status Management
**Status Options:**
- Borrador (Draft)
- Aprobado (Approved) 
- En Progreso (In Progress)
- Completado (Completed)

**Status Flow:** No restrictions - any user can change status as needed

### Form Validation Strategy
- **React Hook Form** for form state management
- **Yup** for validation schemas
- Follow existing MUI component patterns
- Consistent error handling and display

### Export Functionality
- **CSV Export** for production budgets
- Export includes: budget summary, product breakdown, cost details
- Use standard browser download mechanism

### Charts & Visualizations  
- Keep simple using existing MUI components
- Basic cost breakdown tables
- No additional charting libraries needed
- Focus on clear data presentation over complex visualizations

### Data Validation Strategy
- **Django Model/Serializer Level Only:** No database constraints for prices/quantities
- **No Circular References:** Inputs and EndProducts are separate entities - no circular BOM possible
- **Provider Selection:** Manual provider selection during BOM creation (no automatic preferred provider)
- **Simple Validation:** Basic field validation without complex business rules

### BOM Management Rules
- **Input vs Product Separation:** BOMs can only contain Inputs, not other EndProducts
- **Manual Provider Selection:** User selects specific InputProvider for each BOM item
- **No Preferred Provider Auto-Selection:** Always require explicit provider choice
- **Cost Calculation:** Manual trigger only, no automatic updates

## Frontend Implementation Strategy

### Dependencies & Setup
**New Dependencies to Install:**
```bash
npm install react-hook-form yup @hookform/resolvers
```

### Menu Integration
**Menu Structure (NO submenus):**
- Add 5 separate main menu items to `menuConfig.tsx`:
  1. **Gestión de Proveedores** → `/textile/providers`
  2. **Gestión de Insumos** → `/textile/inputs`  
  3. **Plantillas BOM** → `/textile/bom-templates`
  4. **Productos Finales** → `/textile/products`
  5. **Presupuestos de Producción** → `/textile/budgets`

### Component Architecture
**Reusable Components to Create:**
```typescript
// Common form components following existing MUI patterns
- BaseFormComponent (React Hook Form + Yup integration)
- FormDialog (Modal form wrapper)
- CreateEditDialog (Create/Edit modal with form)
- CostCalculationButton (Manual recalculation trigger)
- ExportButton (CSV download functionality)

// Following existing DataTableSimple pattern
- TextileDataTable (extends DataTableSimple with textile-specific features)
- CostBreakdownTable (specialized for cost display)
```

### State Management Strategy
**Pure TanStack Query Approach:**
- NO Zustand stores for textile data
- Server state only via TanStack Query
- Use existing `useApi` hooks pattern
- Local component state for UI-only concerns

### API Integration Pattern
**Extend Existing useApi Hooks:**
```typescript
// hooks/useTextileApi.ts
export const useUnits = () => useApiGet<Unit[]>('/textile/units/');
export const useProviders = () => useApiGet<Provider[]>('/textile/providers/');
export const useCreateProvider = () => useApiPost<Provider>('/textile/providers/');
// ... all textile entities

// Cost recalculation endpoints
export const useRecalculateBOMCost = (id: number) => 
  useApiPost<CostResponse>(`/textile/bom-templates/${id}/recalculate-cost/`);
```

### Routing Structure
**Nested Textile Routes:**
```typescript
// routes/TextileRoutes.tsx
<Routes>
  <Route path="providers" element={<ProviderManagement />} />
  <Route path="inputs" element={<InputManagement />} />
  <Route path="bom-templates" element={<BOMTemplateManagement />} />
  <Route path="products" element={<EndProductManagement />} />
  <Route path="budgets" element={<ProductionBudgetManagement />} />
</Routes>

// Integrated into AppRoutes.tsx
<Route path="/textile/*" element={<TextileRoutes />} />
```

### TypeScript Integration
**Add to existing `src/types/index.ts`:**
```typescript
// Textile entity interfaces
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
  address: string;
  phone_number: string;
  provider_type: 'supplier' | 'workshop' | 'other';
  created_at: string;
  updated_at: string;
}

// ... all other textile interfaces
// API response types for cost calculations
export interface CostCalculationResponse {
  success: boolean;
  message: string;
  new_cost: number;
  timestamp: string;
}
```

### Form Implementation Strategy
**React Hook Form + Yup Pattern:**
```typescript
// Base form component with MUI integration
// Validation schemas using Yup
// Error handling following existing patterns
// Design tokens and styling consistency
```

### CSV Export Implementation
**Simple Browser Download:**
```typescript
// utils/csvExport.ts
export const downloadCSV = (data: any[], filename: string) => {
  // Simple CSV generation and browser download
  // No external libraries needed
}
```

### Cost Calculation UI
**Manual Recalculation Features:**
- Action buttons in data tables
- Confirmation dialogs before recalculation
- Loading states during API calls
- Success/error notifications
- Real-time cost updates in UI

### Error Handling
**Follow Existing Patterns:**
- Use existing error response handling
- Toast notifications for user feedback
- Form validation error display
- API error boundary integration

## Final UI/UX Implementation Details

### Menu Icons Configuration
**Selected MUI Icons for Menu Items:**
```typescript
import { 
  Business,        // Gestión de Proveedores
  Category,        // Gestión de Insumos  
  AccountTree,     // Plantillas BOM
  Inventory2,      // Productos Finales
  Assessment       // Presupuestos de Producción
} from '@mui/icons-material';
```

### Dialog Size Configuration
**Modal Dialog Sizes:**
- **Small dialogs**: Unit management (simple forms)
- **Medium dialogs**: Provider, Input management (moderate complexity)
- **Large dialogs**: BOM templates, Production budgets (complex forms)

### Data Table Actions Pattern
**Consistent Action Buttons for All Tables:**
- **Edit button** (EditIcon) - Opens edit dialog
- **Delete button** (DeleteIcon) - Shows confirmation dialog
- **View details button** (VisibilityIcon) - For complex entities
- Actions positioned in rightmost column

### Currency Format Standard
**Colombian Peso (COP) Display:**
- Format: `$1.234,56 COP` (Colombian number format)
- Thousands separator: `.` (dot)
- Decimal separator: `,` (comma)
- Always show currency code `COP`

### Notification Strategy
**Toast Notifications (Existing Pattern):**
- Success: Green toast for successful operations
- Error: Red toast for failed operations  
- Info: Blue toast for informational messages
- Follow existing toast duration and positioning

### Loading States Implementation
**Skeleton Loading (Existing Components):**
- Use existing skeleton patterns from `DataTableSimple`
- Circular progress for button loading states
- Linear progress for cost recalculation operations
- Maintain consistency with existing loading UX

### BOM Template Builder Interface
**Step-by-Step Wizard Approach:**
```typescript
// 3-Step Wizard Process:
// Step 1: Template Info (name, description)
// Step 2: Add BOM Items (input selection, provider, quantities)
// Step 3: Review & Cost Calculation
```

### Production Budget Builder Interface  
**Table with Checkboxes & Quantities:**
```typescript
// Multi-product selection table:
// - Checkbox column for product selection
// - Product details columns  
// - Quantity input column
// - Real-time cost calculation
// - Summary section at bottom
```

### Responsive Design Strategy
**Follow Project's Custom Breakpoints:**
- Use existing breakpoint configuration
- Maintain responsive table layouts
- Stack form elements on mobile
- Hide non-essential columns on smaller screens

### Development Testing Strategy
**Direct Django API Testing:**
- No mock data creation needed
- Test against live Django endpoints
- Use existing Docker development setup
- API endpoints available at `/api/textile/`

### Component File Structure
**Organized Component Architecture:**
```
src/components/
├── Textile/
│   ├── Common/
│   │   ├── BaseFormComponent.tsx
│   │   ├── FormDialog.tsx
│   │   ├── CreateEditDialog.tsx
│   │   ├── CostCalculationButton.tsx
│   │   ├── ExportButton.tsx
│   │   └── TextileDataTable.tsx
│   ├── Provider/
│   │   ├── ProviderManagement.tsx
│   │   ├── ProviderForm.tsx
│   │   └── ProviderTable.tsx
│   ├── Input/
│   │   ├── InputManagement.tsx
│   │   ├── InputForm.tsx
│   │   └── InputProviderManager.tsx
│   ├── BOM/
│   │   ├── BOMTemplateManagement.tsx
│   │   ├── BOMTemplateWizard.tsx
│   │   └── BOMItemsTable.tsx
│   ├── Product/
│   │   ├── EndProductManagement.tsx
│   │   ├── EndProductForm.tsx
│   │   └── AdditionalCostsManager.tsx
│   └── Budget/
│       ├── ProductionBudgetManagement.tsx
│       ├── BudgetBuilder.tsx
│       └── BudgetSummary.tsx
```

## Implementation Execution Plan

### Phase 1: Dependencies & Core Setup
**Install Required Dependencies:**
```bash
npm install react-hook-form yup @hookform/resolvers
```

**Implementation Order:**
1. Install dependencies + TypeScript interfaces
2. Common components (BaseForm, FormDialog, etc.)
3. Menu integration + routing setup  
4. API hooks for all textile entities
5. Provider Management (simplest entity)
6. Input Management + InputProvider relationships
7. BOM Templates + Wizard interface
8. End Products + Additional costs
9. Production Budgets + Builder interface

### Currency Formatting Utility
**Colombian Peso Formatter:**
```typescript
// utils/formatCurrency.ts
export const formatCOP = (amount: number) => `$${amount.toLocaleString('es-CO')} COP`
// Result: $1.234,56 COP (Colombian format)
```

### Delete Confirmation Pattern
**Use Existing ConfirmationDialog Component:**
- Follow existing `ConfirmationDialog.tsx` pattern
- MUI Dialog with custom styling
- Consistent with existing delete operations
- Standard confirmation flow

### Form Validation Strategy
**Inline Error Display:**
- Validation errors appear below each field
- Real-time validation on field blur
- React Hook Form + Yup integration
- Consistent error styling with existing forms

### Feature Implementation Approach
**Complete One Feature at a Time:**
- Implement Provider Management completely before moving to next
- Test each feature against Django API endpoints
- Ensure full CRUD operations work before proceeding
- Maintain code quality and consistency throughout

### Django Implementation Structure
**Model Organization:**
```
backend/app/core/
├── models.py                    # Existing models (TimeStampedModel, etc.)
├── textile_models.py           # New textile models (imports TimeStampedModel)
├── admin.py                    # Existing admin
├── textile_admin.py            # New textile model admin registration
├── serializers.py              # New DRF serializers
├── views.py                    # New API ViewSets
├── urls.py                     # Explicit URL patterns (no routers)
└── management/commands/
    ├── recalculate_bom_costs.py
    ├── recalculate_product_costs.py
    └── recalculate_budget_costs.py
```

**Migration Strategy:**
1. **Models Migration:** Create all textile models structure
2. **Initial Data Fixture:** Load basic units via Django fixture

**Management Commands:**
```bash
python manage.py recalculate_bom_costs        # Recalculate all BOM template costs
python manage.py recalculate_product_costs    # Recalculate all end product costs  
python manage.py recalculate_budget_costs     # Recalculate all production budget costs
```

**Manual Recalculation API Endpoints:**
```
POST /api/bom-templates/{id}/recalculate-cost/
POST /api/end-products/{id}/recalculate-cost/  
POST /api/production-budgets/{id}/recalculate-cost/
```

**Initial Data Setup:**
1. **Migration:** Create all textile models
2. **Fixture Loading:**
   ```bash
   python manage.py loaddata initial_units.json
   ```
3. **Fixture File Location:** `backend/app/core/fixtures/initial_units.json`

**Initial Data Fixture:**
```json
// fixtures/initial_units.json
[
  {"model": "core.unit", "fields": {"name_en": "Units", "name_es": "Unidades", "abbreviation": "un"}},
  {"model": "core.unit", "fields": {"name_en": "Meters", "name_es": "Metros", "abbreviation": "m"}},
  {"model": "core.unit", "fields": {"name_en": "Kilograms", "name_es": "Kilogramos", "abbreviation": "kg"}}
]
```

**API Structure Approach:**
- **No DRF Routers:** Use explicit URL patterns in urls.py
- **Serializer Relationships:** Use IDs only, no nested objects
- **Separate API Calls:** Client makes multiple requests for related data
- **Admin Registration:** All textile models in textile_admin.py

**ViewSet Implementation:**
```python
# core/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from core.utils.error_handling import ErrorResponseBuilder

class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    
    @action(detail=True, methods=['post'])
    def recalculate_cost(self, request, pk=None):
        # Cost recalculation using ErrorResponseBuilder
        pass
```

**Error Handling Pattern:**
```python
# Following existing ErrorResponseBuilder pattern
from core.utils.error_handling import ErrorResponseBuilder

# Validation errors
if not serializer.is_valid():
    return ErrorResponseBuilder.validation_error(
        serializer.errors, 
        "Error en la validación de datos"
    )

# Standard error response format:
{
  "success": false,
  "message": "Error message",
  "errors": {...},
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

**Final URL Structure:**
```
Main Project URLs (app/urls.py):
/api/                                      # Existing core app include
/api/auth/                                 # Existing auth
/api/schema/                               # Existing API docs

Textile URLs (core/urls.py):
/api/health/                               # Existing
/api/info/                                 # Existing  
/api/textile/units/                        # NEW
/api/textile/providers/                    # NEW
/api/textile/inputs/                       # NEW
/api/textile/input-providers/              # NEW
/api/textile/bom-templates/                # NEW
/api/textile/bom-items/                    # NEW
/api/textile/end-products/                 # NEW
/api/textile/additional-costs/             # NEW
/api/textile/production-budgets/           # NEW
/api/textile/production-budget-items/      # NEW
```

**URL Implementation Pattern:**
```python
# core/urls.py - Add to existing file
from django.urls import path, include
from . import views

# Textile URL patterns
textile_urlpatterns = [
    path('units/', views.UnitViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('units/<int:pk>/', views.UnitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path('units/<int:pk>/recalculate-cost/', views.UnitViewSet.as_view({'post': 'recalculate_cost'})),
    # ... all textile ViewSet patterns
]

urlpatterns = [
    path('health/', views.health_check, name='health-check'),  # Existing
    path('info/', views.api_info, name='api-info'),           # Existing
    path('textile/', include(textile_urlpatterns)),           # NEW textile namespace
]
```

**Docker Development Commands:**
```bash
# Migration commands
docker-compose -f docker-compose-local.yml run --rm backend python manage.py makemigrations
docker-compose -f docker-compose-local.yml run --rm backend python manage.py migrate

# Load initial data
docker-compose -f docker-compose-local.yml run --rm backend python manage.py loaddata initial_units.json

# Cost recalculation commands
docker-compose -f docker-compose-local.yml run --rm backend python manage.py recalculate_bom_costs
docker-compose -f docker-compose-local.yml run --rm backend python manage.py recalculate_product_costs
docker-compose -f docker-compose-local.yml run --rm backend python manage.py recalculate_budget_costs
```

**Final File Structure:**
```
backend/app/core/
├── models.py                    # Existing models (TimeStampedModel, etc.)
├── textile_models.py           # NEW: All textile models
├── admin.py                    # Existing admin  
├── textile_admin.py            # NEW: Textile admin registration
├── serializers.py              # NEW: All textile serializers
├── views.py                    # NEW: All textile ViewSets
├── urls.py                     # NEW: Explicit URL patterns
├── fixtures/
│   └── initial_units.json      # NEW: Initial units data
└── management/commands/
    ├── recalculate_bom_costs.py    # NEW
    ├── recalculate_product_costs.py # NEW  
    └── recalculate_budget_costs.py  # NEW
```

**Implementation Order:**
1. **textile_models.py** - All Django models
2. **textile_admin.py** - Admin registration  
3. **serializers.py** - DRF serializers
4. **views.py** - ViewSets with cost recalculation actions
5. **urls.py** - Update with explicit URL patterns and textile namespace
6. **fixtures/initial_units.json** - Initial data
7. **management/commands/** - Cost recalculation commands
8. **Run migrations and load data using Docker commands**

## Frontend Implementation Status

### ✅ **Phase 1: Dependencies & Core Setup - COMPLETED**
- ✅ **Dependencies Installed**: react-hook-form, yup, @hookform/resolvers
- ✅ **TypeScript Interfaces**: Complete textile.ts with all entities and relationships
- ✅ **Currency Utilities**: Colombian peso formatting with formatCOP, parseCOP functions
- ✅ **API Hooks**: useTextileApi.ts with CRUD operations for all entities

### ✅ **Phase 2: Core Management Views - COMPLETED**
- ✅ **Provider Management**: Complete CRUD with form validation
- ✅ **Input Management**: Multi-provider pricing with junction tables
- ✅ **BOM Management**: Template and item management with cost calculations
- ✅ **End Product Management**: BOM integration with additional costs
- ✅ **Production Budget Management**: Status workflow with item management

### ✅ **Phase 3: Component Architecture - COMPLETED**
- ✅ **Form Components**: React Hook Form + Yup validation for all entities
- ✅ **Dialog Components**: Consistent modal dialogs following MUI patterns
- ✅ **Management Components**: Side-by-side layouts for complex relationships
- ✅ **View Components**: List views with actions and cost displays
- ✅ **Integration Components**: Main page components connecting all parts

### ✅ **Phase 4: Routing & Navigation - COMPLETED**
- ✅ **Menu Integration**: All textile routes added to menuConfig.tsx
- ✅ **Route Configuration**: Textile routes integrated in AppRoutes.tsx
- ✅ **URL Structure**: 
  - `/textile/providers` - Provider management
  - `/textile/inputs` - Input management
  - `/textile/boms` - BOM template management
  - `/textile/products` - End product management
  - `/textile/budgets` - Production budget management

### ✅ **Phase 5: System Integration - COMPLETED**
- ✅ **Component File Structure**: Organized under src/components/Textile/
- ✅ **Import Path Resolution**: All components properly located and imported
- ✅ **Frontend Compilation**: No TypeScript or dependency errors
- ✅ **Mock API Configuration**: Textile routes added to passthrough list
- ✅ **Development Environment**: Frontend running successfully on localhost:3000

### 📊 **Implementation Summary**

**Total Components Created:** 21 components across 5 feature areas
- **5 Main Integration Pages**: Providers.tsx, Inputs.tsx, BOMs.tsx, EndProducts.tsx, ProductionBudgets.tsx
- **5 List View Components**: ProvidersView, InputsView, BOMsView, EndProductsView, ProductionBudgetsView
- **8 Form Components**: Provider, Input, BOMTemplate, BOMItem, EndProduct, AdditionalCost, ProductionBudget, ProductionBudgetItem forms
- **8 Dialog Components**: Corresponding modal dialogs for all forms
- **3 Management Components**: InputPricingDialog, BOMItemsManagement, ProductionBudgetItemsManagement, AdditionalCostsManagement

**Key Technical Features Implemented:**
- Multi-provider pricing with junction tables
- Real-time cost calculations and summaries
- Status management for production budgets
- Colombian peso currency formatting throughout
- Comprehensive form validation with React Hook Form + Yup
- Side-by-side UI layouts for complex data relationships
- Manual cost recalculation triggers
- Responsive Material-UI design following project patterns

**Development Environment Status:**
- ✅ **Frontend**: Running at localhost:3000 with no compilation errors
- ✅ **Components**: All properly structured and imported
- ✅ **Routes**: All textile management features accessible
- ✅ **Mock API**: Configured to pass textile requests to backend
- ✅ **TypeScript**: Full type safety with comprehensive interfaces

## Success Criteria
- [ ] Complete CRUD operations for all entities
- [ ] Accurate cost calculations with database caching
- [ ] Multi-provider pricing management
- [ ] Production budget creation and tracking with status workflow
- [ ] Simple inventory tracking (produced quantities)
- [ ] Responsive and intuitive UI following Material-UI patterns
- [ ] Multi-tenant data isolation maintained
- [ ] Integration with existing authentication and admin systems
- [ ] Menu integration with logical workflow order
- [ ] React Hook Form + Yup validation implementation
- [ ] CSV export functionality for budgets
- [ ] Manual cost calculation triggers working correctly
- [ ] Docker-based development workflow
- [ ] Textile URLs integrated under /api/textile/ namespace
- [ ] ErrorResponseBuilder integration for consistent error handling
- [ ] Mock API configuration updated for textile routes passthrough
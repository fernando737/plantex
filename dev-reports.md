# Sistema de Reportes Textiles - Plan de Desarrollo Simple

## Descripción General
Crear un sistema simple de reportes para presupuestos de producción que genere reportes en HTML (para visualización) y CSV (para exportación) directamente desde los datos existentes de presupuestos.

## Reportes Basados en ProductionBudget

### 1. Reporte de Desglose de Costos por Presupuesto
**Propósito**: Mostrar costos detallados para cada producto en un presupuesto
**Fuente de Datos**: ProductionBudget → ProductionBudgetItem → EndProduct

**Contenido**:
- Información del presupuesto (nombre, estado, total)
- Lista de productos con cantidades y costos
- Desglose de costo por unidad (base + BOM + adicionales)

### 2. Reporte de Resumen por Proveedores del Presupuesto  
**Propósito**: Mostrar qué proveedores contribuyen a los costos del presupuesto
**Fuente de Datos**: ProductionBudget → ProductionBudgetItem → EndProduct → BOMTemplate → BOMItem → InputProvider → Provider

**Contenido**:
- Información del presupuesto
- Lista de proveedores con costo total y porcentaje
- Materiales de cada proveedor

### 3. Reporte Detallado de Líneas de Costo del Presupuesto
**Propósito**: Mostrar cada componente individual de costo (materiales, servicios, costos adicionales) por producto
**Fuente de Datos**: ProductionBudget → ProductionBudgetItem → EndProduct → BOMTemplate → BOMItem + AdditionalCost

**Contenido**:
- Información del presupuesto
- Para cada producto:
  - Costo base (entrada del usuario)
  - Cada línea del BOM (material/servicio, cantidad, precio unitario, proveedor, total línea)
  - Cada línea de costo adicional (nombre, costo)
  - Verificación del cálculo total del producto

## Pasos de Implementación Simple

### Paso 1: Agregar Endpoints de Reportes a Vistas Existentes
- [ ] Agregar 3 nuevos métodos al `ProductionBudgetViewSet` existente:
  - `reporte_desglose_costos(self, request, pk=None)`
  - `reporte_resumen_proveedores(self, request, pk=None)`
  - `reporte_detalle_lineas_costo(self, request, pk=None)`
- [ ] Retornar datos JSON que puedan formatearse como HTML o CSV

### Paso 2: Componentes de Reportes Frontend  
- [ ] Agregar botón "Reportes" a ProductionBudgetsView existente
- [ ] Crear componentes simples de visualización de reportes
- [ ] Agregar botones de exportación para descarga CSV

### Paso 3: Plantillas Simples
- [ ] Crear plantillas HTML básicas para cada reporte
- [ ] Agregar funciones utilitarias de generación CSV
- [ ] Sin cache complejo ni procesamiento en segundo plano

## Estructuras de Datos Simples

### Datos del Reporte de Desglose de Costos
```python
{
    "budget": {
        "name": "Budget Q1 2024", 
        "status": "approved",
        "total_budget_cop": "1250000.00"
    },
    "items": [
        {
            "product_name": "Camisa Polo Azul",
            "planned_quantity": 50,
            "unit_cost_cop": "25000.00",
            "total_cost_cop": "1250000.00",
            "base_cost_cop": "10000.00",
            "bom_cost_cop": "12000.00", 
            "additional_costs_cop": "3000.00"
        }
    ]
}
```

### Datos del Reporte de Resumen por Proveedores
```python
{
    "budget": {
        "name": "Budget Q1 2024",
        "total_budget_cop": "1250000.00"
    },
    "providers": [
        {
            "provider_name": "Textiles SA",
            "provider_type": "supplier", 
            "total_cost": "375000.00",
            "percentage": 30.0,
            "materials": ["Tela Cotton", "Botones"]
        }
    ]
}
```

### Datos del Reporte Detallado de Líneas de Costo
```python
{
    "budget": {
        "name": "Budget Q1 2024",
        "total_budget_cop": "1250000.00"
    },
    "products": [
        {
            "product_name": "Camisa Polo Azul",
            "planned_quantity": 100,
            "base_cost_cop": "10000.00",
            "base_cost_total": "1000000.00",  # 100 × 10000
            "bom_items": [
                {
                    "input_name": "Tela Cotton Azul",
                    "input_type": "raw_material",
                    "quantity": "1.5",
                    "unit": "m",
                    "provider_name": "Textiles SA",
                    "unit_price_cop": "5000.00",
                    "line_cost_cop": "7500.00",  # 1.5 × 5000
                    "total_for_quantity": "750000.00"  # 7500 × 100 units
                },
                {
                    "input_name": "Hilo Poliéster",
                    "input_type": "raw_material", 
                    "quantity": "0.1",
                    "unit": "kg",
                    "provider_name": "Hilos del Valle",
                    "unit_price_cop": "8000.00",
                    "line_cost_cop": "800.00",
                    "total_for_quantity": "80000.00"
                }
            ],
            "additional_costs": [
                {
                    "name": "Bordado Logo",
                    "unit_cost_cop": "2000.00",
                    "total_for_quantity": "200000.00"  # 2000 × 100 units
                },
                {
                    "name": "Etiqueta Marca",
                    "unit_cost_cop": "500.00", 
                    "total_for_quantity": "50000.00"
                }
            ],
            "totals": {
                "base_total": "1000000.00",
                "bom_total": "830000.00",  # sum of all BOM line totals
                "additional_total": "250000.00",  # sum of all additional cost totals
                "product_total": "2080000.00",  # base + bom + additional
                "unit_cost": "20800.00"  # product_total / planned_quantity
            }
        }
    ]
}
```

## Detalles de Implementación

### Backend (4 nuevos métodos en ProductionBudgetViewSet)
- `@action(detail=True) def reporte_desglose_costos()`
- `@action(detail=True) def reporte_resumen_proveedores()`  
- `@action(detail=True) def reporte_detalle_lineas_costo()`
- `@action(detail=True) def exportar_reporte()` (con parámetro de formato)

### Frontend (Adiciones simples a vistas existentes)
- Agregar botón "Reportes" a ProductionBudgetsView
- Crear modal/diálogo simple de reportes  
- Agregar funcionalidad de descarga CSV

### Sin Infraestructura Compleja
- No se necesitan nuevos modelos
- Sin procesamiento en segundo plano
- Sin sistema de cache
- Usar patrones API existentes
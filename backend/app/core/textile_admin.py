# backend/app/core/textile_admin.py
"""
Django Admin configuration for Textile Production Planning System
Responsibility: Admin interfaces for all textile models with proper filtering and display.
"""

from django.contrib import admin
from .textile_models import (
    Unit,
    Provider,
    Input,
    InputProvider,
    BOMTemplate,
    BOMItem,
    EndProduct,
    ProductionBudget,
    ProductionBudgetItem,
)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['name_es', 'name_en', 'abbreviation', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name_es', 'name_en', 'abbreviation']
    ordering = ['name_es']


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone_number', 'email', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'address', 'phone_number', 'email']
    ordering = ['name']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name',)
        }),
        ('Contacto', {
            'fields': ('phone_number', 'email', 'address')
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Input)
class InputAdmin(admin.ModelAdmin):
    list_display = ['name', 'input_type', 'unit', 'created_at']
    list_filter = ['input_type', 'unit', 'created_at']
    search_fields = ['name']
    ordering = ['name']
    
    fieldsets = (
        ('Información del Insumo', {
            'fields': ('name', 'input_type', 'unit')
        }),
    )


@admin.register(InputProvider)
class InputProviderAdmin(admin.ModelAdmin):
    list_display = ['input', 'provider', 'price_per_unit_cop', 'is_preferred', 'created_at']
    list_filter = ['is_preferred', 'input__input_type', 'created_at']
    search_fields = ['input__name', 'provider__name']
    ordering = ['input__name', 'provider__name']
    
    fieldsets = (
        ('Relación Insumo-Proveedor', {
            'fields': ('input', 'provider')
        }),
        ('Precio', {
            'fields': ('price_per_unit_cop', 'is_preferred')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('input', 'provider', 'input__unit')


class BOMItemInline(admin.TabularInline):
    model = BOMItem
    extra = 1
    fields = ['input', 'input_provider', 'quantity', 'line_cost_cop']
    readonly_fields = ['line_cost_cop']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('input', 'input_provider', 'input_provider__provider')


@admin.register(BOMTemplate)
class BOMTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'total_cost_cop', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['total_cost_cop', 'created_at', 'updated_at']
    inlines = [BOMItemInline]
    
    fieldsets = (
        ('Información de la Plantilla', {
            'fields': ('name', 'description')
        }),
        ('Costos', {
            'fields': ('total_cost_cop',),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['recalculate_costs']
    
    def recalculate_costs(self, request, queryset):
        """Admin action to recalculate BOM costs"""
        updated = 0
        for bom in queryset:
            # Recalculate BOM item costs first
            for item in bom.bom_items.all():
                item.recalculate_cost()
            # Then recalculate BOM total
            bom.recalculate_cost()
            updated += 1
        
        self.message_user(request, f'{updated} plantillas BOM actualizadas.')
    
    recalculate_costs.short_description = 'Recalcular costos de plantillas seleccionadas'


@admin.register(BOMItem)
class BOMItemAdmin(admin.ModelAdmin):
    list_display = ['bom_template', 'input', 'input_provider', 'quantity', 'line_cost_cop', 'created_at']
    list_filter = ['bom_template', 'input__input_type', 'created_at']
    search_fields = ['bom_template__name', 'input__name', 'input_provider__provider__name']
    ordering = ['bom_template__name', 'input__name']
    readonly_fields = ['line_cost_cop']
    
    fieldsets = (
        ('Plantilla BOM', {
            'fields': ('bom_template',)
        }),
        ('Insumo y Proveedor', {
            'fields': ('input', 'input_provider')
        }),
        ('Cantidad y Costo', {
            'fields': ('quantity', 'line_cost_cop')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'bom_template', 'input', 'input_provider', 'input_provider__provider'
        )



@admin.register(EndProduct)
class EndProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'bom_template', 'total_cost_cop', 'produced_quantity', 'created_at']
    list_filter = ['bom_template', 'created_at']
    search_fields = ['name', 'description', 'bom_template__name']
    ordering = ['name']
    readonly_fields = ['bom_cost_cop', 'total_cost_cop', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Información del Producto', {
            'fields': ('name', 'description', 'bom_template')
        }),
        ('Inventario', {
            'fields': ('produced_quantity',)
        }),
        ('Costos', {
            'fields': ('bom_cost_cop', 'total_cost_cop'),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['recalculate_costs']
    
    def recalculate_costs(self, request, queryset):
        """Admin action to recalculate product costs"""
        updated = 0
        for product in queryset:
            product.recalculate_cost()
            updated += 1
        
        self.message_user(request, f'{updated} productos actualizados.')
    
    recalculate_costs.short_description = 'Recalcular costos de productos seleccionados'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('bom_template')



class ProductionBudgetItemInline(admin.TabularInline):
    model = ProductionBudgetItem
    extra = 1
    fields = ['end_product', 'planned_quantity', 'unit_cost_cop', 'total_cost_cop']
    readonly_fields = ['unit_cost_cop', 'total_cost_cop']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('end_product')


@admin.register(ProductionBudget)
class ProductionBudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'total_budget_cop', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    readonly_fields = ['total_budget_cop', 'created_at', 'updated_at']
    inlines = [ProductionBudgetItemInline]
    
    fieldsets = (
        ('Información del Presupuesto', {
            'fields': ('name', 'description', 'status')
        }),
        ('Presupuesto Total', {
            'fields': ('total_budget_cop',),
            'classes': ('collapse',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['recalculate_budgets', 'mark_as_approved', 'mark_as_in_progress', 'mark_as_completed']
    
    def recalculate_budgets(self, request, queryset):
        """Admin action to recalculate budget totals"""
        updated = 0
        for budget in queryset:
            # Recalculate budget item costs first
            for item in budget.budget_items.all():
                item.recalculate_cost()
            # Then recalculate budget total
            budget.recalculate_budget()
            updated += 1
        
        self.message_user(request, f'{updated} presupuestos actualizados.')
    
    def mark_as_approved(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f'{updated} presupuestos marcados como aprobados.')
    
    def mark_as_in_progress(self, request, queryset):
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} presupuestos marcados como en progreso.')
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} presupuestos marcados como completados.')
    
    recalculate_budgets.short_description = 'Recalcular presupuestos seleccionados'
    mark_as_approved.short_description = 'Marcar como aprobado'
    mark_as_in_progress.short_description = 'Marcar como en progreso'
    mark_as_completed.short_description = 'Marcar como completado'


@admin.register(ProductionBudgetItem)
class ProductionBudgetItemAdmin(admin.ModelAdmin):
    list_display = ['production_budget', 'end_product', 'planned_quantity', 'unit_cost_cop', 'total_cost_cop', 'created_at']
    list_filter = ['production_budget', 'end_product', 'created_at']
    search_fields = ['production_budget__name', 'end_product__name']
    ordering = ['production_budget__name', 'end_product__name']
    readonly_fields = ['unit_cost_cop', 'total_cost_cop']
    
    fieldsets = (
        ('Presupuesto y Producto', {
            'fields': ('production_budget', 'end_product')
        }),
        ('Cantidad y Costos', {
            'fields': ('planned_quantity', 'unit_cost_cop', 'total_cost_cop')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('production_budget', 'end_product')
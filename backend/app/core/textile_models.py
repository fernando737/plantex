# backend/app/core/textile_models.py
"""
Textile Production Planning System Models
Responsibility: Core models for textile production management including
units, providers, inputs, BOMs, products, and production budgets.
"""

from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from .models import TimeStampedModel


class Unit(TimeStampedModel):
    """Basic units for measurements (un, m, kg)"""
    name_en = models.CharField(max_length=50, help_text="English name (e.g., Units)")
    name_es = models.CharField(max_length=50, help_text="Spanish name (e.g., Unidades)")
    abbreviation = models.CharField(
        max_length=10, 
        unique=True, 
        help_text="Unit abbreviation (e.g., un, m, kg)"
    )
    
    class Meta:
        verbose_name = "Unidad"
        verbose_name_plural = "Unidades"
        ordering = ['name_es']
    
    def __str__(self):
        return f"{self.name_es} ({self.abbreviation})"


class Provider(TimeStampedModel):
    """Providers for inputs and services"""
    
    name = models.CharField(max_length=200, help_text="Nombre del proveedor")
    email = models.EmailField(blank=True, help_text="Email de contacto")
    phone_number = models.CharField(max_length=20, blank=True, help_text="Número de teléfono")
    address = models.TextField(blank=True, help_text="Dirección completa")
    notes = models.TextField(blank=True, help_text="Notas adicionales")
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Input(TimeStampedModel):
    """Raw Materials and Services"""
    INPUT_TYPES = [
        ('confection', 'Confección'),
        ('supply', 'Insumo'),
        ('fabric', 'Telas'),
        ('process', 'Procesos'),
    ]
    
    name = models.CharField(max_length=200, help_text="Nombre del insumo")
    input_type = models.CharField(
        max_length=20, 
        choices=INPUT_TYPES,
        help_text="Tipo de insumo"
    )
    unit = models.ForeignKey(
        Unit, 
        on_delete=models.PROTECT,
        help_text="Unidad de medida"
    )
    
    class Meta:
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_input_type_display()})"


class InputProvider(TimeStampedModel):
    """Junction table for Input-Provider relationships with prices"""
    input = models.ForeignKey(
        Input, 
        on_delete=models.CASCADE, 
        related_name='input_providers',
        help_text="Insumo"
    )
    provider = models.ForeignKey(
        Provider, 
        on_delete=models.CASCADE, 
        related_name='provider_inputs',
        help_text="Proveedor"
    )
    price_per_unit_cop = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Precio por unidad en COP"
    )
    is_preferred = models.BooleanField(
        default=False,
        help_text="Proveedor preferido para este insumo"
    )
    notes = models.TextField(
        blank=True,
        help_text="Notas adicionales sobre este precio"
    )
    
    class Meta:
        unique_together = ['input', 'provider']
        verbose_name = "Insumo-Proveedor"
        verbose_name_plural = "Insumos-Proveedores"
        ordering = ['input__name', 'provider__name']
    
    def __str__(self):
        return f"{self.input.name} - {self.provider.name}: ${self.price_per_unit_cop:,.2f}"


class BOMTemplate(TimeStampedModel):
    """Reusable Bill of Materials templates"""
    name = models.CharField(max_length=200, help_text="Nombre de la plantilla BOM")
    description = models.TextField(blank=True, help_text="Descripción detallada")
    total_cost_cop = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Costo total calculado en COP"
    )
    
    class Meta:
        verbose_name = "Plantilla BOM"
        verbose_name_plural = "Plantillas BOM"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def calculate_total_cost(self):
        """Calculate total cost of this BOM template"""
        total = sum(
            item.line_cost_cop for item in self.bom_items.all()
        )
        return total
    
    def recalculate_cost(self):
        """Calculate and save total cost to database"""
        self.total_cost_cop = self.calculate_total_cost()
        self.save(update_fields=['total_cost_cop', 'updated_at'])
        return self.total_cost_cop


class BOMItem(TimeStampedModel):
    """Individual items within a BOM template"""
    bom_template = models.ForeignKey(
        BOMTemplate, 
        on_delete=models.CASCADE,
        related_name='bom_items',
        help_text="Plantilla BOM"
    )
    input = models.ForeignKey(
        Input, 
        on_delete=models.CASCADE,
        help_text="Insumo"
    )
    input_provider = models.ForeignKey(
        InputProvider, 
        on_delete=models.CASCADE,
        help_text="Proveedor seleccionado para este insumo"
    )
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=3,
        validators=[MinValueValidator(Decimal('0.001'))],
        help_text="Cantidad necesaria"
    )
    line_cost_cop = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Costo de línea calculado en COP"
    )
    
    class Meta:
        unique_together = ['bom_template', 'input']
        verbose_name = "Item BOM"
        verbose_name_plural = "Items BOM"
        ordering = ['bom_template__name', 'input__name']
    
    def __str__(self):
        return f"{self.bom_template.name} - {self.input.name} ({self.quantity})"
    
    def calculate_line_cost(self):
        """Calculate cost for this BOM line item"""
        return self.input_provider.price_per_unit_cop * self.quantity
    
    def recalculate_cost(self):
        """Calculate and save line cost to database"""
        self.line_cost_cop = self.calculate_line_cost()
        self.save(update_fields=['line_cost_cop', 'updated_at'])
        return self.line_cost_cop


class EndProduct(TimeStampedModel):
    """Final products with associated BOMs and inventory tracking"""
    name = models.CharField(max_length=200, help_text="Nombre del producto final")
    description = models.TextField(blank=True, help_text="Descripción del producto")
    bom_template = models.ForeignKey(
        BOMTemplate, 
        on_delete=models.PROTECT,
        related_name='end_products',
        help_text="Plantilla BOM asociada"
    )
    bom_cost_cop = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Costo BOM en COP"
    )
    total_cost_cop = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Costo total calculado en COP"
    )
    produced_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Cantidad ya producida (inventario simple)"
    )
    
    class Meta:
        verbose_name = "Producto Final"
        verbose_name_plural = "Productos Finales"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def calculate_bom_cost(self):
        """Get base cost from BOM"""
        return self.bom_template.total_cost_cop
    
    
    def calculate_total_cost(self):
        """Get final product cost from BOM"""
        return self.calculate_bom_cost()
    
    def recalculate_cost(self):
        """Calculate and save all cost fields to database"""
        self.bom_cost_cop = self.calculate_bom_cost()
        self.total_cost_cop = self.calculate_total_cost()
        self.save(update_fields=['bom_cost_cop', 'total_cost_cop', 'updated_at'])
        return self.total_cost_cop



class ProductionBudget(TimeStampedModel):
    """Production budget containing multiple products with status tracking"""
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('approved', 'Aprobado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
    ]
    
    name = models.CharField(max_length=200, help_text="Nombre del presupuesto")
    description = models.TextField(blank=True, help_text="Descripción del presupuesto")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='draft',
        help_text="Estado del presupuesto"
    )
    total_budget_cop = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Presupuesto total calculado en COP"
    )
    
    class Meta:
        verbose_name = "Presupuesto de Producción"
        verbose_name_plural = "Presupuestos de Producción"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"
    
    def calculate_total_budget(self):
        """Calculate total production budget"""
        return sum(
            item.total_cost_cop for item in self.budget_items.all()
        )
    
    def recalculate_budget(self):
        """Calculate and save total budget to database"""
        self.total_budget_cop = self.calculate_total_budget()
        self.save(update_fields=['total_budget_cop', 'updated_at'])
        return self.total_budget_cop


class ProductionBudgetItem(TimeStampedModel):
    """Individual products within a production budget"""
    production_budget = models.ForeignKey(
        ProductionBudget, 
        on_delete=models.CASCADE,
        related_name='budget_items',
        help_text="Presupuesto de producción"
    )
    end_product = models.ForeignKey(
        EndProduct, 
        on_delete=models.CASCADE,
        help_text="Producto final"
    )
    planned_quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Cantidad planificada a producir"
    )
    unit_cost_cop = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0,
        help_text="Costo unitario en COP"
    )
    total_cost_cop = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        help_text="Costo total para esta línea en COP"
    )
    
    class Meta:
        unique_together = ['production_budget', 'end_product']
        verbose_name = "Item de Presupuesto"
        verbose_name_plural = "Items de Presupuesto"
        ordering = ['production_budget__name', 'end_product__name']
    
    def __str__(self):
        return f"{self.production_budget.name} - {self.end_product.name} x{self.planned_quantity}"
    
    def calculate_unit_cost(self):
        """Get cost per unit of this product"""
        return self.end_product.total_cost_cop
    
    def calculate_total_cost(self):
        """Get total cost for this budget line item"""
        return self.calculate_unit_cost() * self.planned_quantity
    
    def recalculate_cost(self):
        """Calculate and save cost fields to database"""
        self.unit_cost_cop = self.calculate_unit_cost()
        self.total_cost_cop = self.calculate_total_cost()
        self.save(update_fields=['unit_cost_cop', 'total_cost_cop', 'updated_at'])
        return self.total_cost_cop
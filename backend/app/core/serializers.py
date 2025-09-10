# backend/app/core/serializers.py
"""
Django REST Framework Serializers for Textile Production Planning System
Responsibility: API serialization for all textile models with ID-only relationships.
"""

from rest_framework import serializers
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


class UnitSerializer(serializers.ModelSerializer):
    """Serializer for Unit model"""
    
    class Meta:
        model = Unit
        fields = [
            'id',
            'name_en',
            'name_es', 
            'abbreviation',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProviderSerializer(serializers.ModelSerializer):
    """Serializer for Provider model"""
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'name',
            'email',
            'phone_number',
            'address',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InputSerializer(serializers.ModelSerializer):
    """Serializer for Input model - uses unit ID only"""
    
    class Meta:
        model = Input
        fields = [
            'id',
            'name',
            'input_type',
            'unit',  # ID only
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InputProviderSerializer(serializers.ModelSerializer):
    """Serializer for InputProvider model - uses IDs only"""
    
    class Meta:
        model = InputProvider
        fields = [
            'id',
            'input',  # ID only
            'provider',  # ID only
            'price_per_unit_cop',
            'is_preferred',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that input and provider combination is unique"""
        input_obj = data.get('input')
        provider_obj = data.get('provider')
        
        # Check for existing combination (excluding current instance for updates)
        existing = InputProvider.objects.filter(
            input=input_obj, 
            provider=provider_obj
        )
        
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                "Esta combinación de insumo y proveedor ya existe."
            )
        
        return data


class BOMTemplateSerializer(serializers.ModelSerializer):
    """Serializer for BOMTemplate model"""
    
    class Meta:
        model = BOMTemplate
        fields = [
            'id',
            'name',
            'description',
            'total_cost_cop',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'total_cost_cop', 'created_at', 'updated_at']


class BOMItemSerializer(serializers.ModelSerializer):
    """Serializer for BOMItem model - uses IDs only"""
    
    class Meta:
        model = BOMItem
        fields = [
            'id',
            'bom_template',  # ID only
            'input',  # ID only
            'input_provider',  # ID only
            'quantity',
            'line_cost_cop',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'line_cost_cop', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that input is unique within BOM template"""
        bom_template = data.get('bom_template')
        input_obj = data.get('input')
        input_provider = data.get('input_provider')
        
        # Check that input is unique in BOM
        existing = BOMItem.objects.filter(
            bom_template=bom_template,
            input=input_obj
        )
        
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                "Este insumo ya existe en la plantilla BOM."
            )
        
        # Validate that input_provider belongs to the input
        if input_provider and input_provider.input != input_obj:
            raise serializers.ValidationError(
                "El proveedor seleccionado no corresponde al insumo especificado."
            )
        
        return data


class EndProductSerializer(serializers.ModelSerializer):
    """Serializer for EndProduct model - uses BOM template ID only"""
    
    class Meta:
        model = EndProduct
        fields = [
            'id',
            'name',
            'description',
            'bom_template',  # ID only
            'bom_cost_cop',
            'total_cost_cop',
            'produced_quantity',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 
            'bom_cost_cop', 
            'total_cost_cop', 
            'created_at', 
            'updated_at'
        ]



class ProductionBudgetSerializer(serializers.ModelSerializer):
    """Serializer for ProductionBudget model"""
    
    class Meta:
        model = ProductionBudget
        fields = [
            'id',
            'name',
            'description',
            'status',
            'total_budget_cop',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'total_budget_cop', 'created_at', 'updated_at']


class ProductionBudgetItemSerializer(serializers.ModelSerializer):
    """Serializer for ProductionBudgetItem model - uses IDs only"""
    
    class Meta:
        model = ProductionBudgetItem
        fields = [
            'id',
            'production_budget',  # ID only
            'end_product',  # ID only
            'planned_quantity',
            'unit_cost_cop',
            'total_cost_cop',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'unit_cost_cop', 'total_cost_cop', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that end product is unique within production budget"""
        production_budget = data.get('production_budget')
        end_product = data.get('end_product')
        
        # Check that end product is unique in production budget
        existing = ProductionBudgetItem.objects.filter(
            production_budget=production_budget,
            end_product=end_product
        )
        
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                "Este producto ya existe en el presupuesto de producción."
            )
        
        return data


# Additional serializers for detailed views (if needed)
class BOMTemplateDetailSerializer(BOMTemplateSerializer):
    """Detailed BOM Template serializer with item count"""
    item_count = serializers.SerializerMethodField()
    
    class Meta(BOMTemplateSerializer.Meta):
        fields = BOMTemplateSerializer.Meta.fields + ['item_count']
    
    def get_item_count(self, obj):
        return obj.bom_items.count()



class ProductionBudgetDetailSerializer(ProductionBudgetSerializer):
    """Detailed Production Budget serializer with item count"""
    item_count = serializers.SerializerMethodField()
    
    class Meta(ProductionBudgetSerializer.Meta):
        fields = ProductionBudgetSerializer.Meta.fields + ['item_count']
    
    def get_item_count(self, obj):
        return obj.budget_items.count()


# Cost recalculation response serializers
class CostRecalculationResponseSerializer(serializers.Serializer):
    """Serializer for cost recalculation API responses"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    new_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    timestamp = serializers.DateTimeField()


class BulkCostRecalculationResponseSerializer(serializers.Serializer):
    """Serializer for bulk cost recalculation API responses"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    updated_count = serializers.IntegerField()
    timestamp = serializers.DateTimeField()
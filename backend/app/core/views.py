# backend/app/core/views.py
"""
Core views for the baseline application and Textile Production Planning System.
Includes existing health/info endpoints and new textile ViewSets.
"""

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from core.utils.error_handling import ErrorResponseBuilder

from .textile_models import (
    Unit,
    Provider,
    Input,
    InputProvider,
    BOMTemplate,
    BOMItem,
    EndProduct,
    AdditionalCost,
    ProductionBudget,
    ProductionBudgetItem,
)
from .serializers import (
    UnitSerializer,
    ProviderSerializer,
    InputSerializer,
    InputProviderSerializer,
    BOMTemplateSerializer,
    BOMTemplateDetailSerializer,
    BOMItemSerializer,
    EndProductSerializer,
    EndProductDetailSerializer,
    AdditionalCostSerializer,
    ProductionBudgetSerializer,
    ProductionBudgetDetailSerializer,
    ProductionBudgetItemSerializer,
)


# Existing endpoints
@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint to verify the API is running.
    """
    return Response({
        'status': 'healthy',
        'message': 'API is running successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_info(request):
    """
    API information endpoint.
    """
    return Response({
        'name': 'Baseline Multi-Tenant API',
        'version': '1.0.0',
        'description': 'A baseline Django REST API with multi-tenancy and authentication',
        'tenant': getattr(request, 'tenant', None),
    }, status=status.HTTP_200_OK)


# Textile ViewSets
class UnitViewSet(viewsets.ModelViewSet):
    """ViewSet for Unit model"""
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer


class ProviderViewSet(viewsets.ModelViewSet):
    """ViewSet for Provider model"""
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    
    def get_queryset(self):
        queryset = Provider.objects.all()
        provider_type = self.request.query_params.get('provider_type', None)
        if provider_type is not None:
            queryset = queryset.filter(provider_type=provider_type)
        return queryset


class InputViewSet(viewsets.ModelViewSet):
    """ViewSet for Input model"""
    queryset = Input.objects.select_related('unit').all()
    serializer_class = InputSerializer
    
    def get_queryset(self):
        queryset = Input.objects.select_related('unit').all()
        input_type = self.request.query_params.get('input_type', None)
        if input_type is not None:
            queryset = queryset.filter(input_type=input_type)
        return queryset


class InputProviderViewSet(viewsets.ModelViewSet):
    """ViewSet for InputProvider model"""
    queryset = InputProvider.objects.select_related('input', 'provider', 'input__unit').all()
    serializer_class = InputProviderSerializer
    
    def get_queryset(self):
        queryset = InputProvider.objects.select_related('input', 'provider', 'input__unit').all()
        
        # Filter by input
        input_id = self.request.query_params.get('input', None)
        if input_id is not None:
            queryset = queryset.filter(input=input_id)
        
        # Filter by provider
        provider_id = self.request.query_params.get('provider', None)
        if provider_id is not None:
            queryset = queryset.filter(provider=provider_id)
        
        # Filter by preferred
        is_preferred = self.request.query_params.get('is_preferred', None)
        if is_preferred is not None:
            queryset = queryset.filter(is_preferred=is_preferred.lower() == 'true')
        
        return queryset


class BOMTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for BOMTemplate model with cost recalculation"""
    queryset = BOMTemplate.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BOMTemplateDetailSerializer
        return BOMTemplateSerializer
    
    @action(detail=True, methods=['post'])
    def recalculate_cost(self, request, pk=None):
        """Recalculate cost for a specific BOM template"""
        try:
            bom_template = self.get_object()
            
            # Recalculate BOM item costs first
            for item in bom_template.bom_items.all():
                item.recalculate_cost()
            
            # Then recalculate BOM total
            new_cost = bom_template.recalculate_cost()
            
            response_data = {
                'success': True,
                'message': f'Costo de plantilla BOM "{bom_template.name}" recalculado exitosamente.',
                'new_cost': new_cost,
                'timestamp': timezone.now().isoformat(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e, 
                context="recalcular costo de plantilla BOM",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def recalculate_all_costs(self, request):
        """Recalculate costs for all BOM templates"""
        try:
            updated_count = 0
            
            for bom_template in BOMTemplate.objects.all():
                # Recalculate BOM item costs first
                for item in bom_template.bom_items.all():
                    item.recalculate_cost()
                
                # Then recalculate BOM total
                bom_template.recalculate_cost()
                updated_count += 1
            
            response_data = {
                'success': True,
                'message': f'Costos de {updated_count} plantillas BOM recalculados exitosamente.',
                'updated_count': updated_count,
                'timestamp': timezone.now().isoformat(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="recalcular todos los costos de plantillas BOM",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BOMItemViewSet(viewsets.ModelViewSet):
    """ViewSet for BOMItem model"""
    queryset = BOMItem.objects.select_related(
        'bom_template', 'input', 'input_provider', 'input_provider__provider'
    ).all()
    serializer_class = BOMItemSerializer
    
    def get_queryset(self):
        queryset = BOMItem.objects.select_related(
            'bom_template', 'input', 'input_provider', 'input_provider__provider'
        ).all()
        
        # Filter by BOM template
        bom_template_id = self.request.query_params.get('bom_template', None)
        if bom_template_id is not None:
            queryset = queryset.filter(bom_template=bom_template_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Automatically recalculate line cost and BOM total after creating BOM item"""
        bom_item = serializer.save()
        bom_item.recalculate_cost()
        # Also recalculate the BOM template total
        bom_item.bom_template.recalculate_cost()
    
    def perform_update(self, serializer):
        """Automatically recalculate line cost and BOM total after updating BOM item"""
        bom_item = serializer.save()
        bom_item.recalculate_cost()
        # Also recalculate the BOM template total
        bom_item.bom_template.recalculate_cost()
    
    def perform_destroy(self, instance):
        """Recalculate BOM total after deleting BOM item"""
        bom_template = instance.bom_template
        super().perform_destroy(instance)
        # Recalculate the BOM template total after item deletion
        bom_template.recalculate_cost()


class EndProductViewSet(viewsets.ModelViewSet):
    """ViewSet for EndProduct model with cost recalculation"""
    queryset = EndProduct.objects.select_related('bom_template').all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EndProductDetailSerializer
        return EndProductSerializer
    
    @action(detail=True, methods=['post'])
    def recalculate_cost(self, request, pk=None):
        """Recalculate cost for a specific end product"""
        try:
            end_product = self.get_object()
            new_cost = end_product.recalculate_cost()
            
            response_data = {
                'success': True,
                'message': f'Costo del producto "{end_product.name}" recalculado exitosamente.',
                'new_cost': new_cost,
                'timestamp': timezone.now().isoformat(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="recalcular costo de producto final",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def recalculate_all_costs(self, request):
        """Recalculate costs for all end products"""
        try:
            updated_count = 0
            
            for end_product in EndProduct.objects.all():
                end_product.recalculate_cost()
                updated_count += 1
            
            response_data = {
                'success': True,
                'message': f'Costos de {updated_count} productos finales recalculados exitosamente.',
                'updated_count': updated_count,
                'timestamp': timezone.now().isoformat(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="recalcular todos los costos de productos finales",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """Automatically recalculate costs after creating end product"""
        # Extract additional costs from request data before saving
        additional_costs_data = self.request.data.get('additional_costs', [])
        
        end_product = serializer.save()
        
        # Create additional costs if provided
        self._create_additional_costs(end_product, additional_costs_data)
        
        # Recalculate all costs
        end_product.recalculate_cost()

    def perform_update(self, serializer):
        """Automatically recalculate costs after updating end product"""
        # Extract additional costs from request data before saving
        additional_costs_data = self.request.data.get('additional_costs', [])
        
        end_product = serializer.save()
        
        # Update additional costs if provided
        self._update_additional_costs(end_product, additional_costs_data)
        
        # Recalculate all costs
        end_product.recalculate_cost()
    
    def _create_additional_costs(self, end_product, additional_costs_data):
        """Helper method to create additional costs for a new end product"""
        from .textile_models import AdditionalCost
        
        for cost_data in additional_costs_data:
            if cost_data.get('name') and cost_data.get('value_cop'):
                AdditionalCost.objects.create(
                    end_product=end_product,
                    name=cost_data['name'],
                    value_cop=cost_data['value_cop']
                )
    
    def _update_additional_costs(self, end_product, additional_costs_data):
        """Helper method to update additional costs for an existing end product"""
        from .textile_models import AdditionalCost
        
        # Get existing additional costs
        existing_costs = {cost.id: cost for cost in end_product.additional_costs.all()}
        updated_cost_ids = set()
        
        # Process each cost in the form data
        for cost_data in additional_costs_data:
            if not cost_data.get('name') or not cost_data.get('value_cop'):
                continue
                
            cost_id = cost_data.get('id')
            
            if cost_id and not cost_data.get('isNew', False):
                # Update existing cost
                if cost_id in existing_costs:
                    existing_cost = existing_costs[cost_id]
                    existing_cost.name = cost_data['name']
                    existing_cost.value_cop = cost_data['value_cop']
                    existing_cost.save()
                    updated_cost_ids.add(cost_id)
            else:
                # Create new cost
                AdditionalCost.objects.create(
                    end_product=end_product,
                    name=cost_data['name'],
                    value_cop=cost_data['value_cop']
                )
        
        # Delete costs that were removed from the form
        costs_to_delete = set(existing_costs.keys()) - updated_cost_ids
        if costs_to_delete:
            AdditionalCost.objects.filter(id__in=costs_to_delete).delete()


class AdditionalCostViewSet(viewsets.ModelViewSet):
    """ViewSet for AdditionalCost model"""
    queryset = AdditionalCost.objects.select_related('end_product').all()
    serializer_class = AdditionalCostSerializer
    
    def get_queryset(self):
        queryset = AdditionalCost.objects.select_related('end_product').all()
        
        # Filter by end product
        end_product_id = self.request.query_params.get('end_product', None)
        if end_product_id is not None:
            queryset = queryset.filter(end_product=end_product_id)
        
        return queryset


class ProductionBudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for ProductionBudget model with cost recalculation"""
    queryset = ProductionBudget.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductionBudgetDetailSerializer
        return ProductionBudgetSerializer
    
    def get_queryset(self):
        queryset = ProductionBudget.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter is not None:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def recalculate_cost(self, request, pk=None):
        """Recalculate cost for a specific production budget"""
        try:
            production_budget = self.get_object()
            
            # Recalculate budget item costs first
            for item in production_budget.budget_items.all():
                item.recalculate_cost()
            
            # Then recalculate budget total
            new_budget = production_budget.recalculate_budget()
            
            response_data = {
                'success': True,
                'message': f'Presupuesto "{production_budget.name}" recalculado exitosamente.',
                'new_cost': new_budget,
                'timestamp': timezone.now().isoformat(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="recalcular presupuesto de producción",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def recalculate_all_costs(self, request):
        """Recalculate costs for all production budgets"""
        try:
            updated_count = 0
            
            for budget in ProductionBudget.objects.all():
                # Recalculate budget item costs first
                for item in budget.budget_items.all():
                    item.recalculate_cost()
                
                # Then recalculate budget total
                budget.recalculate_budget()
                updated_count += 1
            
            response_data = {
                'success': True,
                'message': f'Presupuestos de {updated_count} presupuestos de producción recalculados exitosamente.',
                'updated_count': updated_count,
                'timestamp': timezone.now().isoformat(),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="recalcular todos los presupuestos de producción",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def cost_breakdown_report(self, request, pk=None):
        """Generate cost breakdown report for production budget"""
        try:
            production_budget = self.get_object()
            
            # Get budget items with related data
            budget_items = ProductionBudgetItem.objects.select_related(
                'end_product', 'end_product__bom_template'
            ).filter(production_budget=production_budget)
            
            # Build report data
            report_data = {
                "budget": {
                    "name": production_budget.name,
                    "status": production_budget.get_status_display(),
                    "total_budget_cop": str(production_budget.total_budget_cop)
                },
                "items": []
            }
            
            for item in budget_items:
                item_data = {
                    "product_name": item.end_product.name,
                    "planned_quantity": item.planned_quantity,
                    "unit_cost_cop": str(item.unit_cost_cop),
                    "total_cost_cop": str(item.total_cost_cop),
                    "base_cost_cop": str(item.end_product.base_cost_cop),
                    "bom_cost_cop": str(item.end_product.bom_cost_cop),
                    "additional_costs_cop": str(item.end_product.additional_costs_cop)
                }
                report_data["items"].append(item_data)
            
            return Response(report_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="generar reporte de desglose de costos",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def provider_summary_report(self, request, pk=None):
        """Generate provider summary report for production budget"""
        try:
            production_budget = self.get_object()
            
            # Get budget items with full relationship chain
            budget_items = ProductionBudgetItem.objects.select_related(
                'end_product', 'end_product__bom_template'
            ).prefetch_related(
                'end_product__bom_template__bom_items__input_provider__provider'
            ).filter(production_budget=production_budget)
            
            # Collect provider data
            provider_costs = {}
            total_budget = float(production_budget.total_budget_cop)
            
            for item in budget_items:
                end_product = item.end_product
                if end_product.bom_template:
                    bom_items = end_product.bom_template.bom_items.all()
                    for bom_item in bom_items:
                        provider = bom_item.input_provider.provider
                        provider_key = f"{provider.name}_{provider.provider_type}"
                        
                        if provider_key not in provider_costs:
                            provider_costs[provider_key] = {
                                "provider_name": provider.name,
                                "provider_type": provider.get_provider_type_display(),
                                "total_cost": 0,
                                "materials": set()
                            }
                        
                        # Calculate cost for this provider in this budget
                        line_cost = float(bom_item.line_cost_cop) * item.planned_quantity
                        provider_costs[provider_key]["total_cost"] += line_cost
                        provider_costs[provider_key]["materials"].add(bom_item.input.name)
            
            # Build report data
            providers_list = []
            for provider_data in provider_costs.values():
                percentage = (provider_data["total_cost"] / total_budget * 100) if total_budget > 0 else 0
                providers_list.append({
                    "provider_name": provider_data["provider_name"],
                    "provider_type": provider_data["provider_type"],
                    "total_cost": f"{provider_data['total_cost']:.2f}",
                    "percentage": round(percentage, 1),
                    "materials": list(provider_data["materials"])
                })
            
            # Sort by total cost descending
            providers_list.sort(key=lambda x: float(x["total_cost"]), reverse=True)
            
            report_data = {
                "budget": {
                    "name": production_budget.name,
                    "total_budget_cop": str(production_budget.total_budget_cop)
                },
                "providers": providers_list
            }
            
            return Response(report_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="generar reporte de resumen por proveedores",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def detailed_line_items_report(self, request, pk=None):
        """Generate detailed line items cost report for production budget"""
        try:
            production_budget = self.get_object()
            
            # Get budget items with full relationship chain
            budget_items = ProductionBudgetItem.objects.select_related(
                'end_product', 'end_product__bom_template'
            ).prefetch_related(
                'end_product__bom_template__bom_items__input',
                'end_product__bom_template__bom_items__input__unit',
                'end_product__bom_template__bom_items__input_provider__provider',
                'end_product__additional_costs'
            ).filter(production_budget=production_budget)
            
            # Build detailed report data
            report_data = {
                "budget": {
                    "name": production_budget.name,
                    "total_budget_cop": str(production_budget.total_budget_cop)
                },
                "products": []
            }
            
            for item in budget_items:
                end_product = item.end_product
                
                # Base cost calculation
                base_cost_total = float(end_product.base_cost_cop) * item.planned_quantity
                
                # BOM items detail
                bom_items = []
                bom_total = 0
                
                if end_product.bom_template:
                    for bom_item in end_product.bom_template.bom_items.all():
                        total_for_quantity = float(bom_item.line_cost_cop) * item.planned_quantity
                        bom_total += total_for_quantity
                        
                        bom_items.append({
                            "input_name": bom_item.input.name,
                            "input_type": bom_item.input.get_input_type_display(),
                            "quantity": str(bom_item.quantity),
                            "unit": bom_item.input.unit.abbreviation,
                            "provider_name": bom_item.input_provider.provider.name,
                            "unit_price_cop": str(bom_item.input_provider.price_per_unit_cop),
                            "line_cost_cop": str(bom_item.line_cost_cop),
                            "total_for_quantity": f"{total_for_quantity:.2f}"
                        })
                
                # Additional costs detail
                additional_costs = []
                additional_total = 0
                
                for additional_cost in end_product.additional_costs.all():
                    total_for_quantity = float(additional_cost.value_cop) * item.planned_quantity
                    additional_total += total_for_quantity
                    
                    additional_costs.append({
                        "name": additional_cost.name,
                        "unit_cost_cop": str(additional_cost.value_cop),
                        "total_for_quantity": f"{total_for_quantity:.2f}"
                    })
                
                # Product totals
                product_total = base_cost_total + bom_total + additional_total
                unit_cost = product_total / item.planned_quantity if item.planned_quantity > 0 else 0
                
                product_data = {
                    "product_name": end_product.name,
                    "planned_quantity": item.planned_quantity,
                    "base_cost_cop": str(end_product.base_cost_cop),
                    "base_cost_total": f"{base_cost_total:.2f}",
                    "bom_items": bom_items,
                    "additional_costs": additional_costs,
                    "totals": {
                        "base_total": f"{base_cost_total:.2f}",
                        "bom_total": f"{bom_total:.2f}",
                        "additional_total": f"{additional_total:.2f}",
                        "product_total": f"{product_total:.2f}",
                        "unit_cost": f"{unit_cost:.2f}"
                    }
                }
                
                report_data["products"].append(product_data)
            
            return Response(report_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="generar reporte detallado de líneas de costo",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def export_report(self, request, pk=None):
        """Export reports in CSV format"""
        try:
            format_type = request.query_params.get('format', 'json')
            report_type = request.query_params.get('type', 'desglose_costos')
            
            if format_type == 'csv':
                # For now, return CSV-ready data structure
                # In a full implementation, this would generate actual CSV files
                if report_type == 'cost_breakdown':
                    response = self.cost_breakdown_report(request, pk)
                elif report_type == 'provider_summary':
                    response = self.provider_summary_report(request, pk)
                elif report_type == 'detailed_line_items':
                    response = self.detailed_line_items_report(request, pk)
                else:
                    return Response(
                        {"error": "Tipo de reporte no válido"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Add CSV format indicator to response
                data = response.data
                data['format'] = 'csv'
                return Response(data, status=status.HTTP_200_OK)
            
            else:
                return Response(
                    {"error": "Formato no soportado. Use format=csv"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            return ErrorResponseBuilder.exception_error(
                e,
                context="exportar reporte",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductionBudgetItemViewSet(viewsets.ModelViewSet):
    """ViewSet for ProductionBudgetItem model"""
    queryset = ProductionBudgetItem.objects.select_related(
        'production_budget', 'end_product'
    ).all()
    serializer_class = ProductionBudgetItemSerializer
    
    def get_queryset(self):
        queryset = ProductionBudgetItem.objects.select_related(
            'production_budget', 'end_product'
        ).all()
        
        # Filter by production budget
        budget_id = self.request.query_params.get('production_budget', None)
        if budget_id is not None:
            queryset = queryset.filter(production_budget=budget_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Automatically recalculate cost after creating budget item"""
        budget_item = serializer.save()
        budget_item.recalculate_cost()
    
    def perform_update(self, serializer):
        """Automatically recalculate cost after updating budget item"""
        budget_item = serializer.save()
        budget_item.recalculate_cost()
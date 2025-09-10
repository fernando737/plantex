# backend/app/core/urls.py
"""
URL configuration for core app including textile endpoints.
"""

from django.urls import path, include
from . import views

# Textile URL patterns
textile_urlpatterns = [
    # Units
    path('units/', views.UnitViewSet.as_view({'get': 'list', 'post': 'create'}), name='unit-list'),
    path('units/<int:pk>/', views.UnitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='unit-detail'),
    
    # Providers
    path('providers/', views.ProviderViewSet.as_view({'get': 'list', 'post': 'create'}), name='provider-list'),
    path('providers/<int:pk>/', views.ProviderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='provider-detail'),
    
    # Inputs
    path('inputs/', views.InputViewSet.as_view({'get': 'list', 'post': 'create'}), name='input-list'),
    path('inputs/<int:pk>/', views.InputViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='input-detail'),
    
    # Input-Provider relationships
    path('input-providers/', views.InputProviderViewSet.as_view({'get': 'list', 'post': 'create'}), name='input-provider-list'),
    path('input-providers/<int:pk>/', views.InputProviderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='input-provider-detail'),
    
    # BOM Templates
    path('bom-templates/', views.BOMTemplateViewSet.as_view({'get': 'list', 'post': 'create'}), name='bom-template-list'),
    path('bom-templates/<int:pk>/', views.BOMTemplateViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='bom-template-detail'),
    path('bom-templates/<int:pk>/recalculate-cost/', views.BOMTemplateViewSet.as_view({'post': 'recalculate_cost'}), name='bom-template-recalculate-cost'),
    path('bom-templates/recalculate-all-costs/', views.BOMTemplateViewSet.as_view({'post': 'recalculate_all_costs'}), name='bom-template-recalculate-all-costs'),
    
    # BOM Items
    path('bom-items/', views.BOMItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='bom-item-list'),
    path('bom-items/<int:pk>/', views.BOMItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='bom-item-detail'),
    
    # End Products
    path('end-products/', views.EndProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='end-product-list'),
    path('end-products/<int:pk>/', views.EndProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='end-product-detail'),
    
    
    # Production Budgets
    path('production-budgets/', views.ProductionBudgetViewSet.as_view({'get': 'list', 'post': 'create'}), name='production-budget-list'),
    path('production-budgets/<int:pk>/', views.ProductionBudgetViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='production-budget-detail'),
    path('production-budgets/<int:pk>/recalculate-cost/', views.ProductionBudgetViewSet.as_view({'post': 'recalculate_cost'}), name='production-budget-recalculate-cost'),
    path('production-budgets/recalculate-all-costs/', views.ProductionBudgetViewSet.as_view({'post': 'recalculate_all_costs'}), name='production-budget-recalculate-all-costs'),
    
    # Production Budget Reports
    path('production-budgets/<int:pk>/cost-breakdown-report/', views.ProductionBudgetViewSet.as_view({'get': 'cost_breakdown_report'}), name='production-budget-cost-breakdown-report'),
    path('production-budgets/<int:pk>/provider-summary-report/', views.ProductionBudgetViewSet.as_view({'get': 'provider_summary_report'}), name='production-budget-provider-summary-report'),
    path('production-budgets/<int:pk>/detailed-line-items-report/', views.ProductionBudgetViewSet.as_view({'get': 'detailed_line_items_report'}), name='production-budget-detailed-line-items-report'),
    path('production-budgets/<int:pk>/export-report/', views.ProductionBudgetViewSet.as_view({'get': 'export_report'}), name='production-budget-export-report'),
    
    # Production Budget Items
    path('production-budget-items/', views.ProductionBudgetItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='production-budget-item-list'),
    path('production-budget-items/<int:pk>/', views.ProductionBudgetItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='production-budget-item-detail'),
]

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('info/', views.api_info, name='api-info'),
    path('textile/', include(textile_urlpatterns)),
]
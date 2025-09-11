# backend/app/core/utils/csv_operations/exporters.py
"""
CSV Exporter implementations for textile models
"""

from typing import Dict, List
from django.db import models
from ...textile_models import Provider
from .base import AbstractCSVExporter


class ProviderCSVExporter(AbstractCSVExporter):
    """
    CSV Exporter for Provider model
    """
    
    def __init__(self):
        super().__init__(Provider)
    
    def get_export_fields(self) -> List[str]:
        """
        Return list of Provider fields to export
        """
        return [
            'id',
            'name',
            'email',
            'phone_number', 
            'address',
            'notes',
            'created_at',
            'updated_at'
        ]
    
    def get_field_headers(self) -> Dict[str, str]:
        """
        Return mapping of field names to CSV column headers in Spanish
        """
        return {
            'id': 'ID',
            'name': 'Nombre',
            'email': 'Email',
            'phone_number': 'Teléfono',
            'address': 'Dirección',
            'notes': 'Notas',
            'created_at': 'Fecha Creación',
            'updated_at': 'Última Actualización'
        }
    
    def format_field_value(self, instance: Provider, field_name: str) -> str:
        """
        Format Provider field values for CSV export
        """
        value = getattr(instance, field_name, '')
        
        if value is None:
            return ''
        
        # Special formatting for datetime fields
        if field_name in ['created_at', 'updated_at'] and hasattr(value, 'strftime'):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        
        # Handle empty strings and None values
        if value == '':
            return ''
        
        return str(value)
    
    def get_queryset(self, **filters) -> models.QuerySet:
        """
        Get Provider queryset for export with optional filtering
        """
        queryset = Provider.objects.all()
        
        # Apply filters
        if filters:
            # Support date range filtering
            if 'created_after' in filters:
                queryset = queryset.filter(created_at__gte=filters['created_after'])
            if 'created_before' in filters:
                queryset = queryset.filter(created_at__lte=filters['created_before'])
            
            # Support name filtering
            if 'name_contains' in filters:
                queryset = queryset.filter(name__icontains=filters['name_contains'])
            
            # Support email filtering
            if 'has_email' in filters and filters['has_email']:
                queryset = queryset.exclude(email__isnull=True).exclude(email='')
            
            # Remove custom filter keys that aren't model fields
            model_filters = {k: v for k, v in filters.items() 
                           if k not in ['created_after', 'created_before', 'name_contains', 'has_email']}
            
            if model_filters:
                queryset = queryset.filter(**model_filters)
        
        return queryset.order_by('name')
    
    def generate_import_template(self) -> str:
        """
        Generate CSV template specifically for importing providers
        Returns only the essential fields needed for import
        """
        import io
        import csv
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Import template fields (excluding auto-generated fields)
        import_fields = ['name', 'email', 'phone_number', 'address', 'notes']
        import_headers = {
            'name': 'Nombre *',  # * indicates required
            'email': 'Email',
            'phone_number': 'Teléfono',
            'address': 'Dirección',
            'notes': 'Notas'
        }
        
        # Write headers
        headers = [import_headers[field] for field in import_fields]
        writer.writerow(headers)
        
        # Add example row with sample data
        example_row = [
            'Textiles ABC S.A.S.',  # name
            'contacto@textilesabc.com',  # email  
            '+57 1 234-5678',  # phone_number
            'Calle 123 #45-67, Bogotá',  # address
            'Proveedor principal de telas'  # notes
        ]
        writer.writerow(example_row)
        
        template_content = output.getvalue()
        output.close()
        
        return template_content
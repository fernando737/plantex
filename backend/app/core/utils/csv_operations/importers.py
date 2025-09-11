# backend/app/core/utils/csv_operations/importers.py
"""
CSV Importer implementations for textile models
"""

import re
from typing import Dict, Any, Optional
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from ...textile_models import Provider
from .base import AbstractCSVImporter
from .exceptions import CSVValidationError


class ProviderCSVImporter(AbstractCSVImporter):
    """
    CSV Importer for Provider model
    """
    
    def __init__(self, batch_size: int = 100):
        super().__init__(Provider, batch_size)
    
    def get_field_mapping(self) -> Dict[str, str]:
        """
        Map CSV columns to Provider model fields
        Supports multiple column name variations for flexibility
        """
        return {
            # Name field mappings
            'name': 'name',
            'nombre': 'name',
            'proveedor': 'name',
            'provider_name': 'name',
            'company': 'name',
            'empresa': 'name',
            
            # Email field mappings
            'email': 'email',
            'correo': 'email',
            'mail': 'email',
            'email_address': 'email',
            
            # Phone field mappings
            'phone': 'phone_number',
            'phone_number': 'phone_number',
            'telefono': 'phone_number',
            'tel': 'phone_number',
            'celular': 'phone_number',
            
            # Address field mappings
            'address': 'address',
            'direccion': 'address',
            'location': 'address',
            'ubicacion': 'address',
            
            # Notes field mappings
            'notes': 'notes',
            'notas': 'notes',
            'comments': 'notes',
            'comentarios': 'notes',
            'description': 'notes',
            'descripcion': 'notes',
        }
    
    def validate_row(self, row_data: Dict[str, Any], line_number: int) -> Dict[str, Any]:
        """
        Validate a single row of Provider data
        """
        validated_data = {}
        
        # Required field: name
        if 'name' not in row_data or not row_data['name']:
            raise CSVValidationError(
                "Provider name is required",
                field='name',
                line_number=line_number
            )
        
        # Validate and clean name
        name = row_data['name'].strip()
        if len(name) > 200:
            raise CSVValidationError(
                f"Provider name too long (max 200 characters, got {len(name)})",
                field='name',
                line_number=line_number
            )
        validated_data['name'] = name
        
        # Validate email if provided
        if 'email' in row_data and row_data['email']:
            email = row_data['email'].strip().lower()
            try:
                validate_email(email)
                validated_data['email'] = email
            except ValidationError:
                raise CSVValidationError(
                    f"Invalid email format: {email}",
                    field='email',
                    line_number=line_number
                )
        
        # Validate phone number if provided
        if 'phone_number' in row_data and row_data['phone_number']:
            phone = row_data['phone_number'].strip()
            
            # Remove common phone formatting characters
            cleaned_phone = re.sub(r'[^\d+\-\s\(\)]', '', phone)
            
            if len(cleaned_phone) > 20:
                raise CSVValidationError(
                    f"Phone number too long (max 20 characters, got {len(cleaned_phone)})",
                    field='phone_number',
                    line_number=line_number
                )
            
            validated_data['phone_number'] = cleaned_phone
        
        # Validate address if provided
        if 'address' in row_data and row_data['address']:
            address = row_data['address'].strip()
            if len(address) > 500:
                raise CSVValidationError(
                    f"Address too long (max 500 characters, got {len(address)})",
                    field='address',
                    line_number=line_number
                )
            validated_data['address'] = address
        
        # Validate notes if provided
        if 'notes' in row_data and row_data['notes']:
            notes = row_data['notes'].strip()
            if len(notes) > 1000:
                raise CSVValidationError(
                    f"Notes too long (max 1000 characters, got {len(notes)})",
                    field='notes',
                    line_number=line_number
                )
            validated_data['notes'] = notes
        
        return validated_data
    
    def create_instance(self, validated_data: Dict[str, Any]) -> Provider:
        """
        Create a Provider instance from validated data
        """
        try:
            return Provider(**validated_data)
        except Exception as e:
            raise CSVValidationError(f"Failed to create provider: {str(e)}")
    
    def check_duplicates(self, validated_data: Dict[str, Any]) -> Optional[Provider]:
        """
        Check for existing providers with the same name
        """
        try:
            return Provider.objects.get(name__iexact=validated_data['name'])
        except Provider.DoesNotExist:
            return None
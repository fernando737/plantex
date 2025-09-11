# backend/app/core/utils/csv_operations/base.py
"""
Abstract base classes for CSV import/export operations
"""

import csv
import io
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Union, Iterator
from django.db import models, transaction
from django.core.exceptions import ValidationError
from .exceptions import CSVImportError, CSVExportError, CSVValidationError


class AbstractCSVImporter(ABC):
    """
    Abstract base class for CSV import operations
    """
    
    def __init__(self, model_class: models.Model, batch_size: int = 100):
        self.model_class = model_class
        self.batch_size = batch_size
        self.errors = []
        self.imported_count = 0
        self.skipped_count = 0
        
    @abstractmethod
    def get_field_mapping(self) -> Dict[str, str]:
        """
        Return a mapping of CSV column names to model field names
        Format: {'csv_column': 'model_field'}
        """
        pass
    
    @abstractmethod
    def validate_row(self, row_data: Dict[str, Any], line_number: int) -> Dict[str, Any]:
        """
        Validate a single row of data and return cleaned data
        Should raise CSVValidationError for validation failures
        """
        pass
    
    @abstractmethod
    def create_instance(self, validated_data: Dict[str, Any]) -> models.Model:
        """
        Create a model instance from validated data
        """
        pass
    
    def get_csv_dialect(self, sample: str) -> csv.Dialect:
        """
        Detect CSV dialect from a sample
        """
        try:
            return csv.Sniffer().sniff(sample, delimiters=',;\t')
        except:
            # Default to excel dialect
            return csv.excel
    
    def read_csv(self, file_content: Union[str, bytes, io.StringIO]) -> Iterator[Dict[str, str]]:
        """
        Read CSV content and yield rows as dictionaries
        """
        if isinstance(file_content, bytes):
            file_content = file_content.decode('utf-8')
        
        if isinstance(file_content, str):
            file_content = io.StringIO(file_content)
        
        # Read sample to detect dialect
        sample = file_content.read(1024)
        file_content.seek(0)
        
        dialect = self.get_csv_dialect(sample)
        reader = csv.DictReader(file_content, dialect=dialect)
        
        for row in reader:
            yield row
    
    def map_row_data(self, row: Dict[str, str]) -> Dict[str, Any]:
        """
        Map CSV row data to model fields based on field mapping
        """
        field_mapping = self.get_field_mapping()
        mapped_data = {}
        
        for csv_field, model_field in field_mapping.items():
            if csv_field in row:
                value = row[csv_field].strip() if row[csv_field] else None
                if value:  # Only include non-empty values
                    mapped_data[model_field] = value
        
        return mapped_data
    
    def check_duplicates(self, validated_data: Dict[str, Any]) -> Optional[models.Model]:
        """
        Check if record already exists. Override in subclasses for custom logic.
        Default implementation checks by 'name' field if it exists.
        """
        if 'name' in validated_data:
            try:
                return self.model_class.objects.get(name=validated_data['name'])
            except self.model_class.DoesNotExist:
                pass
        return None
    
    def import_csv(self, file_content: Union[str, bytes, io.StringIO], 
                   validate_only: bool = False, 
                   skip_duplicates: bool = True,
                   continue_on_error: bool = True) -> Dict[str, Any]:
        """
        Import data from CSV content
        """
        self.errors = []
        self.imported_count = 0
        self.skipped_count = 0
        
        instances_to_create = []
        line_number = 1  # Start from 1 (header is line 0)
        
        try:
            for row in self.read_csv(file_content):
                line_number += 1
                
                try:
                    # Map CSV fields to model fields
                    mapped_data = self.map_row_data(row)
                    
                    if not mapped_data:
                        self.skipped_count += 1
                        continue
                    
                    # Validate row data
                    validated_data = self.validate_row(mapped_data, line_number)
                    
                    # Check for duplicates
                    if skip_duplicates:
                        existing = self.check_duplicates(validated_data)
                        if existing:
                            self.skipped_count += 1
                            continue
                    
                    if not validate_only:
                        # Create instance
                        instance = self.create_instance(validated_data)
                        instances_to_create.append(instance)
                        
                        # Batch create when batch size is reached
                        if len(instances_to_create) >= self.batch_size:
                            self._batch_create(instances_to_create)
                            instances_to_create = []
                    
                    self.imported_count += 1
                    
                except (CSVValidationError, ValidationError) as e:
                    error_msg = f"Line {line_number}: {str(e)}"
                    self.errors.append(error_msg)
                    
                    if not continue_on_error:
                        raise CSVImportError(f"Import failed at line {line_number}: {str(e)}", 
                                           line_number=line_number, errors=self.errors)
                
                except Exception as e:
                    error_msg = f"Line {line_number}: Unexpected error - {str(e)}"
                    self.errors.append(error_msg)
                    
                    if not continue_on_error:
                        raise CSVImportError(error_msg, line_number=line_number, errors=self.errors)
            
            # Create remaining instances
            if not validate_only and instances_to_create:
                self._batch_create(instances_to_create)
                
        except CSVImportError:
            raise
        except Exception as e:
            raise CSVImportError(f"Failed to process CSV: {str(e)}", errors=self.errors)
        
        return {
            'imported_count': self.imported_count,
            'skipped_count': self.skipped_count,
            'error_count': len(self.errors),
            'errors': self.errors,
            'validate_only': validate_only
        }
    
    def _batch_create(self, instances: List[models.Model]):
        """
        Create instances in batch using database transaction
        """
        try:
            with transaction.atomic():
                for instance in instances:
                    instance.save()
        except Exception as e:
            raise CSVImportError(f"Failed to save batch: {str(e)}")


class AbstractCSVExporter(ABC):
    """
    Abstract base class for CSV export operations
    """
    
    def __init__(self, model_class: models.Model):
        self.model_class = model_class
    
    @abstractmethod
    def get_export_fields(self) -> List[str]:
        """
        Return list of field names to export
        """
        pass
    
    @abstractmethod
    def get_field_headers(self) -> Dict[str, str]:
        """
        Return mapping of field names to CSV column headers
        Format: {'model_field': 'CSV Header'}
        """
        pass
    
    def get_queryset(self, **filters) -> models.QuerySet:
        """
        Get queryset for export. Override for custom filtering/ordering.
        """
        queryset = self.model_class.objects.all()
        
        # Apply filters
        if filters:
            queryset = queryset.filter(**filters)
        
        return queryset.order_by('id')
    
    def format_field_value(self, instance: models.Model, field_name: str) -> str:
        """
        Format field value for CSV export. Override for custom formatting.
        """
        value = getattr(instance, field_name, '')
        
        if value is None:
            return ''
        
        # Handle different field types
        if isinstance(value, bool):
            return 'Yes' if value else 'No'
        
        return str(value)
    
    def export_csv(self, output_file=None, **filters) -> Union[str, None]:
        """
        Export data to CSV format
        Returns CSV content as string if output_file is None, otherwise writes to file
        """
        try:
            output = io.StringIO()
            
            export_fields = self.get_export_fields()
            field_headers = self.get_field_headers()
            
            # Create CSV writer
            writer = csv.writer(output)
            
            # Write headers
            headers = [field_headers.get(field, field) for field in export_fields]
            writer.writerow(headers)
            
            # Write data rows
            queryset = self.get_queryset(**filters)
            for instance in queryset:
                row = []
                for field_name in export_fields:
                    value = self.format_field_value(instance, field_name)
                    row.append(value)
                writer.writerow(row)
            
            csv_content = output.getvalue()
            output.close()
            
            if output_file:
                with open(output_file, 'w', newline='', encoding='utf-8') as f:
                    f.write(csv_content)
                return None
            
            return csv_content
            
        except Exception as e:
            raise CSVExportError(f"Failed to export CSV: {str(e)}")
    
    def generate_template(self) -> str:
        """
        Generate CSV template with headers only
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        export_fields = self.get_export_fields()
        field_headers = self.get_field_headers()
        
        # Write headers only
        headers = [field_headers.get(field, field) for field in export_fields]
        writer.writerow(headers)
        
        # Add one example row with placeholder data
        example_row = [''] * len(headers)
        writer.writerow(example_row)
        
        template_content = output.getvalue()
        output.close()
        
        return template_content
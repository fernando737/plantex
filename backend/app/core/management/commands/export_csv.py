# backend/app/core/management/commands/export_csv.py
"""
Django management command for exporting CSV data
"""

import os
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from core.utils.csv_operations import (
    ProviderCSVExporter,
    CSVExportError
)


class Command(BaseCommand):
    help = 'Export data to CSV files for various textile models'
    
    SUPPORTED_MODELS = {
        'providers': {
            'exporter': ProviderCSVExporter,
            'description': 'Export providers to CSV',
            'default_filename': 'proveedores'
        },
    }
    
    def add_arguments(self, parser):
        parser.add_argument(
            'model',
            type=str,
            choices=self.SUPPORTED_MODELS.keys(),
            help='Model to export data from'
        )
        
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path (default: auto-generated with timestamp)'
        )
        
        parser.add_argument(
            '--directory',
            type=str,
            default=os.getcwd(),
            help='Output directory (default: current directory)'
        )
        
        # Date range filters
        parser.add_argument(
            '--date-from',
            type=str,
            help='Export records created from this date (YYYY-MM-DD)'
        )
        
        parser.add_argument(
            '--date-to',
            type=str,
            help='Export records created up to this date (YYYY-MM-DD)'
        )
        
        # Provider-specific filters
        parser.add_argument(
            '--name-contains',
            type=str,
            help='Export providers with names containing this text'
        )
        
        parser.add_argument(
            '--has-email',
            action='store_true',
            help='Export only providers with email addresses'
        )
        
        parser.add_argument(
            '--template',
            action='store_true',
            help='Generate import template instead of exporting data'
        )
    
    def handle(self, *args, **options):
        model = options['model']
        output_path = options['output']
        directory = options['directory']
        generate_template = options['template']
        
        # Get exporter class
        model_config = self.SUPPORTED_MODELS[model]
        exporter_class = model_config['exporter']
        default_filename = model_config['default_filename']
        
        # Generate output filename if not provided
        if not output_path:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            if generate_template:
                filename = f'plantilla_{default_filename}_{timestamp}.csv'
            else:
                filename = f'{default_filename}_{timestamp}.csv'
            output_path = os.path.join(directory, filename)
        
        # Ensure output directory exists
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        try:
            # Initialize exporter
            exporter = exporter_class()
            
            if generate_template:
                self.stdout.write(f'Generating import template for {model}...')
                
                # Generate template
                if hasattr(exporter, 'generate_import_template'):
                    template_content = exporter.generate_import_template()
                else:
                    template_content = exporter.generate_template()
                
                # Write template to file
                with open(output_path, 'w', newline='', encoding='utf-8') as f:
                    f.write(template_content)
                
                self.stdout.write(
                    self.style.SUCCESS(f'Template generated successfully: {output_path}')
                )
                
            else:
                # Build export filters
                filters = self.build_filters(options, model)
                
                self.stdout.write(f'Exporting {model} to {output_path}...')
                
                if filters:
                    filter_desc = ', '.join([f'{k}={v}' for k, v in filters.items()])
                    self.stdout.write(f'Applying filters: {filter_desc}')
                
                # Export CSV
                exporter.export_csv(output_file=output_path, **filters)
                
                # Get record count for feedback
                record_count = self.get_record_count(exporter, filters)
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully exported {record_count} records to: {output_path}')
                )
                
        except CSVExportError as e:
            self.stdout.write(
                self.style.ERROR(f'Export failed: {str(e)}')
            )
            raise CommandError('Export failed')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {str(e)}')
            )
            raise CommandError('Export failed due to unexpected error')
    
    def build_filters(self, options, model):
        """Build filters dictionary from command options"""
        filters = {}
        
        # Date range filters
        if options['date_from']:
            try:
                date_from = datetime.strptime(options['date_from'], '%Y-%m-%d').date()
                filters['created_after'] = date_from
            except ValueError:
                raise CommandError('Invalid date format for --date-from. Use YYYY-MM-DD')
        
        if options['date_to']:
            try:
                date_to = datetime.strptime(options['date_to'], '%Y-%m-%d').date()
                filters['created_before'] = date_to
            except ValueError:
                raise CommandError('Invalid date format for --date-to. Use YYYY-MM-DD')
        
        # Model-specific filters
        if model == 'providers':
            if options['name_contains']:
                filters['name_contains'] = options['name_contains']
            
            if options['has_email']:
                filters['has_email'] = True
        
        return filters
    
    def get_record_count(self, exporter, filters):
        """Get the count of records that will be exported"""
        try:
            queryset = exporter.get_queryset(**filters)
            return queryset.count()
        except:
            return 'unknown'
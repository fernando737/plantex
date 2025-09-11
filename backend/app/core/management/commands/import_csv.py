# backend/app/core/management/commands/import_csv.py
"""
Django management command for importing CSV data
"""

import os
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from core.utils.csv_operations import (
    ProviderCSVImporter,
    CSVImportError
)


class Command(BaseCommand):
    help = 'Import data from CSV files for various textile models'
    
    SUPPORTED_MODELS = {
        'providers': {
            'importer': ProviderCSVImporter,
            'description': 'Import providers from CSV'
        },
    }
    
    def add_arguments(self, parser):
        parser.add_argument(
            'model',
            type=str,
            choices=self.SUPPORTED_MODELS.keys(),
            help='Model to import data for'
        )
        
        parser.add_argument(
            'file_path',
            type=str,
            help='Path to the CSV file to import'
        )
        
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Validate data without importing (preview mode)'
        )
        
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of records to process in each batch (default: 100)'
        )
        
        parser.add_argument(
            '--skip-duplicates',
            action='store_true',
            default=True,
            help='Skip duplicate records instead of failing'
        )
        
        parser.add_argument(
            '--continue-on-error',
            action='store_true', 
            default=True,
            help='Continue importing when encountering errors'
        )
        
        parser.add_argument(
            '--fail-fast',
            action='store_true',
            help='Stop import on first error (overrides --continue-on-error)'
        )
    
    def handle(self, *args, **options):
        model = options['model']
        file_path = options['file_path']
        dry_run = options['dry_run']
        batch_size = options['batch_size']
        skip_duplicates = options['skip_duplicates']
        continue_on_error = options['continue_on_error'] and not options['fail_fast']
        
        # Validate file exists
        if not os.path.exists(file_path):
            raise CommandError(f'File not found: {file_path}')
        
        if not file_path.endswith('.csv'):
            raise CommandError('File must have .csv extension')
        
        # Get importer class
        model_config = self.SUPPORTED_MODELS[model]
        importer_class = model_config['importer']
        
        self.stdout.write(f'Starting import for {model} from {file_path}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Running in DRY-RUN mode - no data will be imported'))
        
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as file:
                file_content = file.read()
            
            # Initialize importer
            importer = importer_class(batch_size=batch_size)
            
            # Import CSV
            with transaction.atomic():
                result = importer.import_csv(
                    file_content=file_content,
                    validate_only=dry_run,
                    skip_duplicates=skip_duplicates,
                    continue_on_error=continue_on_error
                )
                
                # If dry_run, rollback the transaction
                if dry_run:
                    transaction.set_rollback(True)
            
            # Display results
            self.display_results(result, dry_run)
            
        except CSVImportError as e:
            self.stdout.write(
                self.style.ERROR(f'Import failed: {str(e)}')
            )
            
            if hasattr(e, 'errors') and e.errors:
                self.stdout.write(self.style.ERROR('Errors encountered:'))
                for error in e.errors:
                    self.stdout.write(f'  - {error}')
            
            raise CommandError('Import failed')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {str(e)}')
            )
            raise CommandError('Import failed due to unexpected error')
    
    def display_results(self, result, dry_run):
        """Display import results"""
        mode = 'VALIDATION' if dry_run else 'IMPORT'
        
        self.stdout.write(
            self.style.SUCCESS(f'\n{mode} COMPLETED')
        )
        
        # Summary statistics
        self.stdout.write(f'Records processed: {result["imported_count"]}')
        self.stdout.write(f'Records skipped: {result["skipped_count"]}')
        self.stdout.write(f'Errors found: {result["error_count"]}')
        
        # Display errors if any
        if result['errors']:
            self.stdout.write(self.style.WARNING('\nErrors encountered:'))
            for error in result['errors']:
                self.stdout.write(f'  - {error}')
        
        # Final status
        if result['error_count'] == 0:
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(f'\n✓ Validation successful - ready to import {result["imported_count"]} records')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'\n✓ Successfully imported {result["imported_count"]} records')
                )
        else:
            self.stdout.write(
                self.style.WARNING(f'\n⚠ Completed with {result["error_count"]} errors')
            )
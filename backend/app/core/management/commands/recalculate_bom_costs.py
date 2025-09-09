# backend/app/core/management/commands/recalculate_bom_costs.py
"""
Django management command to recalculate all BOM template costs.
Usage: python manage.py recalculate_bom_costs
"""

from django.core.management.base import BaseCommand
from core.textile_models import BOMTemplate


class Command(BaseCommand):
    help = 'Recalculate costs for all BOM templates'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--template-id',
            type=int,
            help='Recalculate cost for a specific BOM template ID',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
    
    def handle(self, *args, **options):
        template_id = options['template_id']
        dry_run = options['dry_run']
        
        if template_id:
            # Recalculate specific BOM template
            try:
                bom_template = BOMTemplate.objects.get(pk=template_id)
                old_cost = bom_template.total_cost_cop
                
                if not dry_run:
                    # Recalculate BOM item costs first
                    for item in bom_template.bom_items.all():
                        item.recalculate_cost()
                    
                    # Then recalculate BOM total
                    new_cost = bom_template.recalculate_cost()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ BOM Template "{bom_template.name}" (ID: {template_id})'
                        )
                    )
                    self.stdout.write(f'  Old cost: ${old_cost:,.2f} COP')
                    self.stdout.write(f'  New cost: ${new_cost:,.2f} COP')
                    self.stdout.write(f'  Difference: ${new_cost - old_cost:+,.2f} COP')
                else:
                    # Calculate what the new cost would be
                    calculated_cost = sum(
                        item.input_provider.price_per_unit_cop * item.quantity 
                        for item in bom_template.bom_items.all()
                    )
                    
                    self.stdout.write(
                        self.style.WARNING(
                            f'[DRY RUN] BOM Template "{bom_template.name}" (ID: {template_id})'
                        )
                    )
                    self.stdout.write(f'  Current cost: ${old_cost:,.2f} COP')
                    self.stdout.write(f'  Would be: ${calculated_cost:,.2f} COP')
                    self.stdout.write(f'  Difference: ${calculated_cost - old_cost:+,.2f} COP')
                
            except BOMTemplate.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'BOM Template with ID {template_id} does not exist')
                )
                return
                
        else:
            # Recalculate all BOM templates
            bom_templates = BOMTemplate.objects.all()
            total_templates = bom_templates.count()
            
            if total_templates == 0:
                self.stdout.write(
                    self.style.WARNING('No BOM templates found')
                )
                return
            
            self.stdout.write(f'Found {total_templates} BOM template(s) to process...')
            
            updated_count = 0
            total_cost_change = 0
            
            for bom_template in bom_templates:
                old_cost = bom_template.total_cost_cop
                
                if not dry_run:
                    # Recalculate BOM item costs first
                    for item in bom_template.bom_items.all():
                        item.recalculate_cost()
                    
                    # Then recalculate BOM total
                    new_cost = bom_template.recalculate_cost()
                    
                    cost_change = new_cost - old_cost
                    total_cost_change += cost_change
                    updated_count += 1
                    
                    self.stdout.write(
                        f'✓ "{bom_template.name}": ${old_cost:,.2f} → ${new_cost:,.2f} COP ({cost_change:+,.2f})'
                    )
                else:
                    # Calculate what the new cost would be
                    calculated_cost = sum(
                        item.input_provider.price_per_unit_cop * item.quantity 
                        for item in bom_template.bom_items.all()
                    )
                    
                    cost_change = calculated_cost - old_cost
                    total_cost_change += cost_change
                    updated_count += 1
                    
                    self.stdout.write(
                        f'[DRY RUN] "{bom_template.name}": ${old_cost:,.2f} → ${calculated_cost:,.2f} COP ({cost_change:+,.2f})'
                    )
            
            # Summary
            if dry_run:
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.WARNING(f'DRY RUN SUMMARY - No changes made')
                )
                self.stdout.write(f'Templates that would be updated: {updated_count}')
                self.stdout.write(f'Total cost change: ${total_cost_change:+,.2f} COP')
            else:
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated {updated_count} BOM templates')
                )
                self.stdout.write(f'Total cost change: ${total_cost_change:+,.2f} COP')
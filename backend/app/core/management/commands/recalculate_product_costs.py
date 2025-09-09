# backend/app/core/management/commands/recalculate_product_costs.py
"""
Django management command to recalculate all end product costs.
Usage: python manage.py recalculate_product_costs
"""

from django.core.management.base import BaseCommand
from core.textile_models import EndProduct


class Command(BaseCommand):
    help = 'Recalculate costs for all end products'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--product-id',
            type=int,
            help='Recalculate cost for a specific end product ID',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
    
    def handle(self, *args, **options):
        product_id = options['product_id']
        dry_run = options['dry_run']
        
        if product_id:
            # Recalculate specific end product
            try:
                end_product = EndProduct.objects.get(pk=product_id)
                old_cost = end_product.total_cost_cop
                
                if not dry_run:
                    new_cost = end_product.recalculate_cost()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ End Product "{end_product.name}" (ID: {product_id})'
                        )
                    )
                    self.stdout.write(f'  Old total cost: ${old_cost:,.2f} COP')
                    self.stdout.write(f'  New BOM cost: ${end_product.bom_cost_cop:,.2f} COP')
                    self.stdout.write(f'  Additional costs: ${end_product.additional_costs_cop:,.2f} COP')
                    self.stdout.write(f'  New total cost: ${new_cost:,.2f} COP')
                    self.stdout.write(f'  Difference: ${new_cost - old_cost:+,.2f} COP')
                else:
                    # Calculate what the new cost would be
                    bom_cost = end_product.bom_template.total_cost_cop
                    additional_costs = sum(
                        cost.value_cop for cost in end_product.additional_costs.all()
                    )
                    calculated_cost = bom_cost + additional_costs
                    
                    self.stdout.write(
                        self.style.WARNING(
                            f'[DRY RUN] End Product "{end_product.name}" (ID: {product_id})'
                        )
                    )
                    self.stdout.write(f'  Current total cost: ${old_cost:,.2f} COP')
                    self.stdout.write(f'  Would be BOM cost: ${bom_cost:,.2f} COP')
                    self.stdout.write(f'  Would be additional costs: ${additional_costs:,.2f} COP')
                    self.stdout.write(f'  Would be total: ${calculated_cost:,.2f} COP')
                    self.stdout.write(f'  Difference: ${calculated_cost - old_cost:+,.2f} COP')
                
            except EndProduct.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'End Product with ID {product_id} does not exist')
                )
                return
                
        else:
            # Recalculate all end products
            end_products = EndProduct.objects.select_related('bom_template').all()
            total_products = end_products.count()
            
            if total_products == 0:
                self.stdout.write(
                    self.style.WARNING('No end products found')
                )
                return
            
            self.stdout.write(f'Found {total_products} end product(s) to process...')
            
            updated_count = 0
            total_cost_change = 0
            
            for end_product in end_products:
                old_cost = end_product.total_cost_cop
                
                if not dry_run:
                    new_cost = end_product.recalculate_cost()
                    
                    cost_change = new_cost - old_cost
                    total_cost_change += cost_change
                    updated_count += 1
                    
                    self.stdout.write(
                        f'✓ "{end_product.name}": ${old_cost:,.2f} → ${new_cost:,.2f} COP ({cost_change:+,.2f})'
                    )
                else:
                    # Calculate what the new cost would be
                    bom_cost = end_product.bom_template.total_cost_cop
                    additional_costs = sum(
                        cost.value_cop for cost in end_product.additional_costs.all()
                    )
                    calculated_cost = bom_cost + additional_costs
                    
                    cost_change = calculated_cost - old_cost
                    total_cost_change += cost_change
                    updated_count += 1
                    
                    self.stdout.write(
                        f'[DRY RUN] "{end_product.name}": ${old_cost:,.2f} → ${calculated_cost:,.2f} COP ({cost_change:+,.2f})'
                    )
            
            # Summary
            if dry_run:
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.WARNING(f'DRY RUN SUMMARY - No changes made')
                )
                self.stdout.write(f'Products that would be updated: {updated_count}')
                self.stdout.write(f'Total cost change: ${total_cost_change:+,.2f} COP')
            else:
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated {updated_count} end products')
                )
                self.stdout.write(f'Total cost change: ${total_cost_change:+,.2f} COP')
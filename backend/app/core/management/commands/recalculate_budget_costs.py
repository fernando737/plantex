# backend/app/core/management/commands/recalculate_budget_costs.py
"""
Django management command to recalculate all production budget costs.
Usage: python manage.py recalculate_budget_costs
"""

from django.core.management.base import BaseCommand
from core.textile_models import ProductionBudget


class Command(BaseCommand):
    help = 'Recalculate costs for all production budgets'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--budget-id',
            type=int,
            help='Recalculate cost for a specific production budget ID',
        )
        parser.add_argument(
            '--status',
            type=str,
            choices=['draft', 'approved', 'in_progress', 'completed'],
            help='Only recalculate budgets with specific status',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
    
    def handle(self, *args, **options):
        budget_id = options['budget_id']
        status_filter = options['status']
        dry_run = options['dry_run']
        
        if budget_id:
            # Recalculate specific production budget
            try:
                budget = ProductionBudget.objects.get(pk=budget_id)
                old_budget = budget.total_budget_cop
                
                if not dry_run:
                    # Recalculate budget item costs first
                    for item in budget.budget_items.all():
                        item.recalculate_cost()
                    
                    # Then recalculate budget total
                    new_budget = budget.recalculate_budget()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Production Budget "{budget.name}" (ID: {budget_id})'
                        )
                    )
                    self.stdout.write(f'  Status: {budget.get_status_display()}')
                    self.stdout.write(f'  Old budget: ${old_budget:,.2f} COP')
                    self.stdout.write(f'  New budget: ${new_budget:,.2f} COP')
                    self.stdout.write(f'  Difference: ${new_budget - old_budget:+,.2f} COP')
                    self.stdout.write(f'  Items in budget: {budget.budget_items.count()}')
                else:
                    # Calculate what the new budget would be
                    calculated_budget = sum(
                        item.end_product.total_cost_cop * item.planned_quantity
                        for item in budget.budget_items.select_related('end_product').all()
                    )
                    
                    self.stdout.write(
                        self.style.WARNING(
                            f'[DRY RUN] Production Budget "{budget.name}" (ID: {budget_id})'
                        )
                    )
                    self.stdout.write(f'  Status: {budget.get_status_display()}')
                    self.stdout.write(f'  Current budget: ${old_budget:,.2f} COP')
                    self.stdout.write(f'  Would be: ${calculated_budget:,.2f} COP')
                    self.stdout.write(f'  Difference: ${calculated_budget - old_budget:+,.2f} COP')
                    self.stdout.write(f'  Items in budget: {budget.budget_items.count()}')
                
            except ProductionBudget.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Production Budget with ID {budget_id} does not exist')
                )
                return
                
        else:
            # Recalculate production budgets (with optional status filter)
            budgets_query = ProductionBudget.objects.all()
            
            if status_filter:
                budgets_query = budgets_query.filter(status=status_filter)
                self.stdout.write(f'Filtering by status: {status_filter}')
            
            budgets = budgets_query.prefetch_related('budget_items__end_product')
            total_budgets = budgets.count()
            
            if total_budgets == 0:
                filter_msg = f" with status '{status_filter}'" if status_filter else ""
                self.stdout.write(
                    self.style.WARNING(f'No production budgets found{filter_msg}')
                )
                return
            
            self.stdout.write(f'Found {total_budgets} production budget(s) to process...')
            
            updated_count = 0
            total_budget_change = 0
            
            for budget in budgets:
                old_budget = budget.total_budget_cop
                
                if not dry_run:
                    # Recalculate budget item costs first
                    for item in budget.budget_items.all():
                        item.recalculate_cost()
                    
                    # Then recalculate budget total
                    new_budget = budget.recalculate_budget()
                    
                    budget_change = new_budget - old_budget
                    total_budget_change += budget_change
                    updated_count += 1
                    
                    status_display = budget.get_status_display()
                    self.stdout.write(
                        f'✓ "{budget.name}" ({status_display}): ${old_budget:,.2f} → ${new_budget:,.2f} COP ({budget_change:+,.2f})'
                    )
                else:
                    # Calculate what the new budget would be
                    calculated_budget = sum(
                        item.end_product.total_cost_cop * item.planned_quantity
                        for item in budget.budget_items.select_related('end_product').all()
                    )
                    
                    budget_change = calculated_budget - old_budget
                    total_budget_change += budget_change
                    updated_count += 1
                    
                    status_display = budget.get_status_display()
                    self.stdout.write(
                        f'[DRY RUN] "{budget.name}" ({status_display}): ${old_budget:,.2f} → ${calculated_budget:,.2f} COP ({budget_change:+,.2f})'
                    )
            
            # Summary
            if dry_run:
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.WARNING(f'DRY RUN SUMMARY - No changes made')
                )
                self.stdout.write(f'Budgets that would be updated: {updated_count}')
                self.stdout.write(f'Total budget change: ${total_budget_change:+,.2f} COP')
            else:
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated {updated_count} production budgets')
                )
                self.stdout.write(f'Total budget change: ${total_budget_change:+,.2f} COP')
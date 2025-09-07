from customers.models import Client, Domain
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a demo tenant for development and testing"

    def handle(self, *args, **options):
        # Check if the tenant already exists
        if not Client.objects.filter(schema_name="demo").exists():
            # Create a tenant
            tenant = Client(
                schema_name="demo",
                name="Demo Tenant",
                paid_until="2024-12-31",
                on_trial=False,
                tenant_code="DEMO",  # Set the tenant code for demo tenant
            )
            tenant.save()

            # Check if the domain already exists
            if not Domain.objects.filter(domain="demo.localhost").exists():
                domain = Domain(
                    domain="demo.localhost",
                    tenant=tenant,
                    is_primary=True,
                )
                domain.save()
                self.stdout.write(
                    self.style.SUCCESS("Demo tenant domain created successfully")
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS("Demo tenant domain already exists")
                )

            self.stdout.write(
                self.style.SUCCESS("Demo tenant created successfully")
            )
        else:
            self.stdout.write(self.style.SUCCESS("Demo tenant already exists"))

from customers.models import Client, Domain
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a public tenant"

    def handle(self, *args, **options):
        # Check if the public tenant already exists
        if not Client.objects.filter(schema_name="public").exists():
            # Create a public tenant
            tenant = Client(
                schema_name="public",
                name="Public Tenant",
                paid_until="2099-12-31",
                on_trial=False,
                tenant_code="PUBLIC",  # Set the tenant code for public tenant
            )
            tenant.save()

            domain = Domain(
                domain=settings.HOST,
                tenant=tenant,
                is_primary=True,
            )
            domain.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Public tenant created successfully for {settings.HOST}"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Public tenant already exists {settings.HOST}")
            )

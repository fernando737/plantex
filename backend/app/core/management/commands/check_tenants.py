from customers.models import Client, Domain
from django.core.management.base import BaseCommand
from django.db import connection
from django_tenants.utils import get_tenant, tenant_context


class Command(BaseCommand):
    help = "Check current tenant setup and diagnose tenant context issues"

    def handle(self, *args, **options):
        self.stdout.write("🔍 Checking Tenant Configuration...")

        # Check if any tenants exist
        tenants = Client.objects.all()
        self.stdout.write(f"📊 Total tenants found: {tenants.count()}")

        for tenant in tenants:
            self.stdout.write(
                f"  - {tenant.schema_name}: {tenant.name} ({tenant.tenant_code})"
            )
            domains = Domain.objects.filter(tenant=tenant)
            for domain in domains:
                self.stdout.write(
                    f"    └── Domain: {domain.domain} (Primary: {domain.is_primary})"
                )

        # Check current connection
        self.stdout.write(f"\n🔌 Current database schema: {connection.schema_name}")

        # Check if we can access tenant context
        try:
            with tenant_context():
                self.stdout.write("✅ Tenant context is working")
                current_tenant = get_tenant()
                self.stdout.write(f"   Current tenant: {current_tenant.schema_name}")
        except Exception as e:
            self.stdout.write(f"❌ Tenant context error: {str(e)}")

        # Check if DocumentTemplate table exists
        try:
            from core.models import DocumentTemplate

            with tenant_context():
                count = DocumentTemplate.objects.count()
                self.stdout.write(f"📄 DocumentTemplate count: {count}")
        except Exception as e:
            self.stdout.write(f"❌ DocumentTemplate error: {str(e)}")

        self.stdout.write(
            "\n💡 If no tenants exist, run: python manage.py create_public_tenant"
        )
        self.stdout.write("💡 If tenant context fails, check your domain configuration")

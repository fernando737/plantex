import getpass
import re
from datetime import datetime, date
from customers.models import Client, Domain
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Interactive production tenant creation with subdomain support"

    def add_arguments(self, parser):
        parser.add_argument(
            '--non-interactive',
            action='store_true',
            help='Run in non-interactive mode (for testing/automation)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("🏢 Production Tenant Creation")
        )
        self.stdout.write("=" * 50)
        
        if not options['non_interactive']:
            self.stdout.write(
                "Enter tenant details (Ctrl+C to cancel):\n"
            )

        try:
            # Collect tenant information
            tenant_data = self.collect_tenant_data(options['non_interactive'])
            
            # Show review
            if not options['non_interactive']:
                if not self.confirm_creation(tenant_data):
                    self.stdout.write(
                        self.style.WARNING("Tenant creation cancelled.")
                    )
                    return

            # Create tenant
            self.create_tenant(tenant_data)
            
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.WARNING("\nTenant creation cancelled.")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"\nError: {str(e)}")
            )
            raise CommandError(f"Tenant creation failed: {str(e)}")

    def collect_tenant_data(self, non_interactive=False):
        """Collect all tenant information interactively"""
        data = {}
        
        # Tenant Name
        while True:
            if non_interactive:
                data['name'] = "Test Tenant"
                break
            name = input("Tenant Name (e.g., 'Acme Corporation'): ").strip()
            if name:
                data['name'] = name
                break
            self.stdout.write(self.style.ERROR("Tenant name is required."))

        # Subdomain
        while True:
            if non_interactive:
                data['subdomain'] = "test"
                break
            subdomain = input("Subdomain (letters/numbers only, e.g., 'acme'): ").strip().lower()
            if self.validate_subdomain(subdomain):
                # Check if subdomain already exists
                full_domain = f"{subdomain}.localhost"  # Default for development
                if Domain.objects.filter(domain__icontains=subdomain).exists():
                    self.stdout.write(self.style.ERROR(f"Subdomain '{subdomain}' already exists."))
                    continue
                data['subdomain'] = subdomain
                break

        # Base Domain (from environment or input)
        base_domain = self.get_base_domain()
        data['base_domain'] = base_domain
        data['full_domain'] = f"{data['subdomain']}.{base_domain}"
        
        # Generate schema name
        data['schema_name'] = self.generate_schema_name(data['subdomain'])
        
        # Admin Email
        while True:
            if non_interactive:
                data['admin_email'] = "admin@test.com"
                break
            email = input("Admin Email: ").strip()
            if self.validate_email_input(email):
                data['admin_email'] = email
                break

        # Admin Password
        while True:
            if non_interactive:
                data['admin_password'] = "testpass123"
                break
            password = getpass.getpass("Admin Password: ")
            if len(password) < 8:
                self.stdout.write(self.style.ERROR("Password must be at least 8 characters."))
                continue
            confirm = getpass.getpass("Confirm Password: ")
            if password != confirm:
                self.stdout.write(self.style.ERROR("Passwords don't match."))
                continue
            data['admin_password'] = password
            break

        # Generate tenant code
        data['tenant_code'] = self.generate_tenant_code(data['subdomain'])
        
        # Set paid_until date (1 year from now)
        data['paid_until'] = date.today().replace(year=date.today().year + 1)
        
        return data

    def validate_subdomain(self, subdomain):
        """Validate subdomain format"""
        if not subdomain:
            self.stdout.write(self.style.ERROR("Subdomain is required."))
            return False
        
        if not re.match(r'^[a-zA-Z0-9]+$', subdomain):
            self.stdout.write(self.style.ERROR("Subdomain can only contain letters and numbers."))
            return False
            
        if len(subdomain) < 2 or len(subdomain) > 20:
            self.stdout.write(self.style.ERROR("Subdomain must be between 2 and 20 characters."))
            return False
            
        # Check for reserved subdomains
        reserved = ['www', 'api', 'admin', 'mail', 'ftp', 'public', 'demo']
        if subdomain in reserved:
            self.stdout.write(self.style.ERROR(f"'{subdomain}' is a reserved subdomain."))
            return False
            
        return True

    def validate_email_input(self, email):
        """Validate email format"""
        if not email:
            self.stdout.write(self.style.ERROR("Email is required."))
            return False
        
        try:
            validate_email(email)
            return True
        except ValidationError:
            self.stdout.write(self.style.ERROR("Invalid email format."))
            return False

    def get_base_domain(self):
        """Get base domain from environment or default"""
        import os
        base_domain = os.getenv('BASE_DOMAIN', 'localhost')
        return base_domain

    def generate_schema_name(self, subdomain):
        """Generate database schema name from subdomain"""
        return f"{subdomain}_prod"

    def generate_tenant_code(self, subdomain):
        """Generate unique tenant code"""
        return subdomain.upper()[:10]

    def confirm_creation(self, data):
        """Show review and ask for confirmation"""
        self.stdout.write("\n" + "=" * 40)
        self.stdout.write(self.style.SUCCESS("Review Tenant Settings:"))
        self.stdout.write("=" * 40)
        self.stdout.write(f"Tenant Name: {data['name']}")
        self.stdout.write(f"Full URL: https://{data['full_domain']}")
        self.stdout.write(f"Database Schema: {data['schema_name']}")
        self.stdout.write(f"Admin Email: {data['admin_email']}")
        self.stdout.write(f"Tenant Code: {data['tenant_code']}")
        self.stdout.write(f"Valid Until: {data['paid_until']}")
        self.stdout.write("=" * 40)
        
        while True:
            confirm = input("\nCreate tenant with these settings? [y/N]: ").strip().lower()
            if confirm in ['y', 'yes']:
                return True
            elif confirm in ['n', 'no', '']:
                return False
            self.stdout.write(self.style.ERROR("Please answer 'y' or 'n'."))

    @transaction.atomic
    def create_tenant(self, data):
        """Create the tenant and domain with all associated data"""
        self.stdout.write("\n🔄 Creating tenant...")
        
        # Check if schema already exists
        if Client.objects.filter(schema_name=data['schema_name']).exists():
            raise CommandError(f"Tenant with schema '{data['schema_name']}' already exists.")
        
        # Create tenant
        tenant = Client(
            schema_name=data['schema_name'],
            name=data['name'],
            paid_until=data['paid_until'],
            on_trial=False,
            tenant_code=data['tenant_code'],
        )
        tenant.save()
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ Tenant '{data['name']}' created successfully")
        )
        
        # Create domain
        domain = Domain(
            domain=data['full_domain'],
            tenant=tenant,
            is_primary=True,
        )
        domain.save()
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ Domain '{data['full_domain']}' created successfully")
        )
        
        # Create admin user in tenant schema
        self.create_admin_user(tenant, data)
        
        # Show success summary
        self.show_success_summary(data)

    def create_admin_user(self, tenant, data):
        """Create admin user in the tenant schema"""
        from django_tenants.utils import schema_context
        
        with schema_context(tenant.schema_name):
            if not User.objects.filter(email=data['admin_email']).exists():
                user = User.objects.create_superuser(
                    email=data['admin_email'],
                    password=data['admin_password']
                )
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Admin user created: {data['admin_email']}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  Admin user already exists: {data['admin_email']}")
                )

    def show_success_summary(self, data):
        """Show final success message with next steps"""
        self.stdout.write("\n" + "🎉" * 40)
        self.stdout.write(
            self.style.SUCCESS("TENANT CREATED SUCCESSFULLY!")
        )
        self.stdout.write("🎉" * 40)
        self.stdout.write(f"\n📍 Access your tenant at: https://{data['full_domain']}")
        self.stdout.write(f"👤 Admin Email: {data['admin_email']}")
        self.stdout.write(f"🏢 Tenant Code: {data['tenant_code']}")
        self.stdout.write(f"🗄️  Database Schema: {data['schema_name']}")
        
        self.stdout.write(f"\n📋 Next Steps:")
        self.stdout.write(f"1. Configure DNS: Point {data['full_domain']} to your server")
        self.stdout.write(f"2. Configure SSL certificate for {data['full_domain']}")
        self.stdout.write(f"3. Update nginx configuration for subdomain routing")
        self.stdout.write(f"4. Login at https://{data['full_domain']}/admin/")
        
        self.stdout.write(f"\n🔗 Useful Commands:")
        self.stdout.write(f"   View tenant: python manage.py shell -c \"from customers.models import Client; print(Client.objects.get(schema_name='{data['schema_name']}'))\"")
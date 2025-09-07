from django.db import models

# Create your models here.
from django_tenants.models import DomainMixin, TenantMixin


class Client(TenantMixin):
    name = models.CharField(max_length=100)
    paid_until = models.DateField()
    on_trial = models.BooleanField()
    created_on = models.DateField(auto_now_add=True)
    tenant_code = models.CharField(
        max_length=10,
        unique=True,
        help_text="Código único para identificar al tenant en los radicados (ej: BOG01)",
        default="PUBLIC",  # Default value for public tenant
    )

    auto_create_schema = True

    def __str__(self):
        return f"{self.name} ({self.tenant_code})"


class Domain(DomainMixin):
    pass

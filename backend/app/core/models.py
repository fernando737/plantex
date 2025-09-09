# backend/app/core/models.py
"""
Core models for the application.
This file can be used to define base models or shared functionality.
"""

from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract base class that provides self-updating
    'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# Import textile models so Django can detect them
from .textile_models import *